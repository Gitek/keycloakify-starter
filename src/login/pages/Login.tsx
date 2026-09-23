import type {JSX} from "keycloakify/tools/JSX";
import {useState, useRef} from "react";
import {kcSanitize} from "keycloakify/lib/kcSanitize";
import {useIsPasswordRevealed} from "keycloakify/tools/useIsPasswordRevealed";
import {clsx} from "keycloakify/tools/clsx";
import type {PageProps} from "keycloakify/login/pages/PageProps";
import {getKcClsx, type KcClsx} from "keycloakify/login/lib/kcClsx";
import type {KcContext} from "../KcContext";
import type {I18n} from "../i18n";

// This file is for the login page specifically.
// The login form is the main element in this file, this includes input fields, social providers etc.

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const {kcContext, i18n, doUseDefaultCss, Template, classes} = props;

    const {kcClsx} = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const {social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField} = kcContext;

    const {msg, msgStr} = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    // ---------------------------------------------------------------------------
    // Passordløs innlogging — PHASE 0 VISUAL MOCK ONLY.
    // No backend, no network. Local state so every screen can be reviewed.
    // Stories force a screen via kcContext.pwlessView / pwlessMock.
    // Phase 5 replaces the mock handler with a POST to url.loginAction.
    //
    // Layout follows Khai's Beslutningsnotat: entry is a text link BELOW the IdP buttons,
    // each screen is its own step with "← Tilbake" at the top, the link lives 10 minutes,
    // resend unlocks after 45 s, and a dead link lands on a recovery screen with the address
    // pre-filled and editable — never a dead end.
    //
    // The note's "show the full address" was later overturned (DQ8 revision, plan §3.6):
    // the confirmation names ALL THREE channels and no address, identically for everyone,
    // so it concedes nothing about whether the account exists.
    //
    // Screens: request → sent → recovery, plus the DQ9 code path for an unproven device
    // and the two device-B screens the link opens (confirm, done).
    // ---------------------------------------------------------------------------
    type PwlessState = "idle" | "missing" | "invalid" | "sending" | "waiting" | "error" | "ratelimited";
    /** Which screen we're on. "off" = the normal login form. */
    type PwlessView = "off" | "request" | "sent" | "recovery" | "code" | "confirm" | "done";

    const pwlessMock = (kcContext as any).pwlessMock as PwlessState | undefined;
    const pwlessMockView = (kcContext as any).pwlessView as PwlessView | undefined;

    const PWLESS_RESEND_SECONDS = 45;

    const [pwlessView, setPwlessView] = useState<PwlessView>(pwlessMockView ?? "off");
    const [pwlessState, setPwlessState] = useState<PwlessState>(pwlessMock ?? "idle");
    const [pwlessCooldown, setPwlessCooldown] = useState(pwlessMockView === "sent" ? PWLESS_RESEND_SECONDS : 0);
    const [pwlessResent, setPwlessResent] = useState<boolean>(((kcContext as any).pwlessResent as boolean) ?? false);
    const [pwlessIdentifier, setPwlessIdentifier] = useState<string>(
        ((kcContext as any).pwlessIdentifier as string | undefined) ?? "");
    const pwlessFieldRef = useRef<HTMLInputElement | null>(null);
    const pwlessRecoveryFieldRef = useRef<HTMLInputElement | null>(null);

    /**
     * Whether the send has been acknowledged. The send response is deliberately instant and
     * identical for everyone, so the screen opens on "Sender …" and settles a beat later.
     * It carries NO channel: the DQ8 revision (§3.6) names all three to everyone, so there is
     * nothing account-specific to wait for — only the acknowledgement itself.
     */
    const [pwlessAcked, setPwlessAcked] = useState<boolean>(
        ((kcContext as any).pwlessAcked as boolean) ?? pwlessMockView === "sent");

    /**
     * DQ9: a device that has not been proven for this account gets a typed code instead of a
     * one-tap link. Stories force it; in Phase 5 the server decides from the signed device cookie.
     */
    const pwlessDeviceProven = ((kcContext as any).pwlessDeviceProven as boolean) ?? true;
    const pwlessCodeRef = useRef<HTMLInputElement | null>(null);
    const [pwlessRemember, setPwlessRemember] = useState(false);


    /**
     * MOCK validation, mirroring the server rule: it is EITHER an email OR a phone.
     * The real check is server-side (libphonenumber, default region NO, isValidNumber) —
     * this is only so the mock gives honest feedback.
     */
    function pwlessLooksValid(v: string): boolean {
        const s = (v || "").trim();
        if (!s) return false;
        if (s.includes("@")) return /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/.test(s);
        if (/[A-Za-zÆØÅæøå]/.test(s)) return false;          // letters ⇒ not a phone
        return s.replace(/\D/g, "").length >= 8;
    }

    /** Entry link is pure navigation — no validation, no error. */
    function pwlessOpen() {
        setPwlessIdentifier(usernameInput.current?.value?.trim() ?? "");
        setPwlessState("idle");
        setPwlessResent(false);
        setPwlessView("request");
    }

    function pwlessStartCooldown() {
        setPwlessCooldown(PWLESS_RESEND_SECONDS);
        const tick = window.setInterval(() => {
            setPwlessCooldown(c => {
                if (c <= 1) {
                    window.clearInterval(tick);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
    }

    /** MOCK: nothing is sent. `resent` drives the "the previous link stops working" copy. */
    function pwlessSend(from: "request" | "recovery" | "resend") {
        const ref = from === "recovery" ? pwlessRecoveryFieldRef : pwlessFieldRef;
        const typed = (from === "resend" ? pwlessIdentifier : ref.current?.value ?? pwlessIdentifier).trim();
        if (!typed) {
            setPwlessState("missing");
            return;
        }
        if (!pwlessLooksValid(typed)) {
            setPwlessState("invalid");
            return;
        }
        setPwlessIdentifier(typed);
        setPwlessState("sending");
        window.setTimeout(() => {
            setPwlessState("waiting");
            setPwlessResent(from !== "request");
            // DQ9: an unproven device never sees a link — it would only land on this screen anyway.
            setPwlessView(pwlessDeviceProven ? "sent" : "code");
            setPwlessAcked(false);
            pwlessStartCooldown();
            // MOCK of the first poll coming back with the resolved channel.
            window.setTimeout(() => setPwlessAcked(true), 1200);
        }, 700);
    }

    /** "Endre adresse" — back to the ask step, address kept so it can be corrected. */
    function pwlessEditAddress() {
        setPwlessState("idle");
        setPwlessView("request");
    }

    function pwlessCancel() {
        setPwlessView("off");
        setPwlessState("idle");
        setPwlessResent(false);
        setPwlessCooldown(0);
    }

    const pwlessBusy = pwlessState === "sending";
    // The credential form stays MOUNTED at all times (intl-tel-input wraps #shown-username-input
    // in a .iti div outside React's knowledge — unmounting it throws NotFoundError). Hide, never unmount.
    const hideCredentialForm = pwlessView !== "off";

    const pwlessStatusText =
        pwlessState === "missing" ? msgStr("pwlessMissingIdentifier")
            : pwlessState === "invalid" ? msgStr("pwlessInvalid")
                : pwlessState === "ratelimited" ? msgStr("pwlessRateLimited")
                    : pwlessState === "error" ? msgStr("pwlessError")
                        : "";

    const pwlessMailIcon = (
        <div className="pwless-icon pwless-icon--ok" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
                 stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="5" width="19" height="14" rx="2.5"/>
                <path d="M3 7l9 6 9-6"/>
            </svg>
        </div>
    );

    const pwlessDeadIcon = (
        <div className="pwless-icon pwless-icon--dead" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
                 stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.8L1.8 20.2h20.4L12 3.8z"/>
                <path d="M12 10v4.2M12 17.4h.01"/>
            </svg>
        </div>
    );

    /**
     * Which IdP to mark "· sist brukt". Phase 5 reads this from a cookie the server sets;
     * for the mock it comes from the story, falling back to a local note if one exists.
     */
    const lastUsedIdp: string | undefined =
        ((kcContext as any).lastUsedIdp as string | undefined) ??
        (typeof window !== "undefined" ? window.localStorage?.getItem("excite.lastIdp") ?? undefined : undefined);

    /** Entry point — a text link BELOW the IdP buttons (§3.5), so the page keeps ONE primary button. */
    const pwlessLink = (
        <span
            id="trigger-passwordless-link"
            role="link"
            tabIndex={0}
            onClick={pwlessOpen}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pwlessOpen();
                }
            }}
            hidden={hideCredentialForm}
        >
            {msgStr("pwlessButton")}
        </span>
    );

    const pwlessBackLink = (
        <span className="pwless-back" role="link" tabIndex={0}
              onClick={pwlessCancel}
              onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pwlessCancel();
                  }
              }}>
            {"← " + msgStr("pwlessBack")}
        </span>
    );

    const pwlessUsePasswordLink = (
        <span className="pwless-alt-link" role="link" tabIndex={0}
              onClick={pwlessCancel}
              onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pwlessCancel();
                  }
              }}>
            {msgStr("pwlessUsePassword")}
        </span>
    );

    /** The dedicated passwordless screens. */
    const pwlessPage = (
        <div id="pwless-page" hidden={pwlessView === "off"}>

            {/* STEP 2 — ask. One field, already filled in from step 1. */}
            <div className="pwless-step pwless-step--left" hidden={pwlessView !== "request"}>
                {pwlessBackLink}
                <h2 className="pwless-title">{msgStr("pwlessTitle")}</h2>
                <p className="pwless-intro">{msgStr("pwlessIntro")}</p>
                <div id="pwless-field-wrapper">
                    <input id="pwless-username-input" ref={pwlessFieldRef} data-iti-input
                           type="text" inputMode="email" autoFocus
                           aria-label={msgStr("pwlessFieldLabel")}
                           placeholder={msgStr("pwlessFieldLabel")}
                           defaultValue={pwlessIdentifier}/>
                </div>
                <p className="pwless-field-hint">{msgStr("pwlessFieldHint")}</p>
                <button type="button" id="pwless-send-btn" onClick={() => pwlessSend("request")}
                        disabled={pwlessBusy} aria-busy={pwlessBusy}>
                    {msgStr("pwlessSendLink")}
                </button>
                {pwlessUsePasswordLink}
            </div>

            {/* STEP 3 — the waiting tab. Not a blind alley: it is the receiver. */}
            <div className="pwless-step" hidden={pwlessView !== "sent"}>
                <div className="pwless-step-top">{pwlessBackLink}</div>
                {pwlessMailIcon}
                <h2 className="pwless-title pwless-title--center">
                    {!pwlessAcked ? msgStr("pwlessSending")
                        : pwlessResent ? msgStr("pwlessResentTitle")
                            : msgStr("pwlessCheckAll")}
                </h2>
                <p className="pwless-sent-to">
                    {!pwlessAcked ? msgStr("pwlessSendingBody")
                        : msgStr(pwlessResent ? "pwlessResentBody" : "pwlessSentToAll")}
                </p>
                <p className="pwless-live">
                    <span className="pwless-dot" aria-hidden="true"/>
                    {msgStr("pwlessWaitingDot")}
                </p>
                <p className="pwless-validity">{msgStr("pwlessKeepOpen")}</p>
                {/* The way out for the person who mistyped: nothing else on this screen
                    explains why a link they are entitled to never arrived. */}
                <p className="pwless-typo-hint" hidden={!pwlessAcked}>{msgStr("pwlessTypoHint")}</p>
                <button type="button" id="pwless-resend-btn" onClick={() => pwlessSend("resend")}
                        disabled={pwlessCooldown > 0}>
                    {pwlessCooldown > 0
                        ? msgStr("pwlessResendIn", String(pwlessCooldown))
                        : msgStr("pwlessResend")}
                </button>
                <span className="pwless-alt-link" role="link" tabIndex={0}
                      onClick={pwlessEditAddress}
                      onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              pwlessEditAddress();
                          }
                      }}>
                    {msgStr("pwlessChangeAddress")}
                </span>
            </div>

            {/* RECOVERY — an expired or already-used link. The address is pre-filled AND editable,
                because a wrong address is exactly why the link never arrived. */}
            <div className="pwless-step" hidden={pwlessView !== "recovery"}>
                {pwlessDeadIcon}
                <h2 className="pwless-title pwless-title--center">{msgStr("pwlessRecoveryTitle")}</h2>
                <p className="pwless-intro pwless-intro--center">{msgStr("pwlessRecoveryIntro")}</p>
                <div id="pwless-recovery-wrapper">
                    <input id="pwless-recovery-input" ref={pwlessRecoveryFieldRef} data-iti-input
                           type="text" inputMode="email"
                           aria-label={msgStr("pwlessFieldLabel")}
                           placeholder={msgStr("pwlessFieldLabel")}
                           defaultValue={pwlessIdentifier}/>
                </div>
                <button type="button" id="pwless-recovery-btn" onClick={() => pwlessSend("recovery")}
                        disabled={pwlessBusy} aria-busy={pwlessBusy}>
                    {msgStr("pwlessRecoverySend")}
                </button>
                {pwlessUsePasswordLink}
            </div>

            {/* CODE — DQ9. Shown when the device has not been proven for this account.
                §3.7 says this is the COMMON path, not an edge case. The code is typed HERE,
                where the login began, which is what binds approver to requester. */}
            <div className="pwless-step" hidden={pwlessView !== "code"}>
                {pwlessBackLink}
                <h2 className="pwless-title">{msgStr("pwlessCodeTitle")}</h2>
                <p className="pwless-intro">{msgStr("pwlessCodeIntro")}</p>
                <div id="pwless-code-wrapper">
                    <input id="pwless-code-input" ref={pwlessCodeRef}
                           type="text" inputMode="numeric" autoComplete="one-time-code"
                           maxLength={6} pattern="[0-9]*"
                           aria-label={msgStr("pwlessCodeLabel")}
                           placeholder={msgStr("pwlessCodeLabel")}/>
                </div>
                <label className="pwless-remember">
                    <input type="checkbox" checked={pwlessRemember}
                           onChange={e => setPwlessRemember(e.target.checked)}/>
                    <span>
                        {msgStr("pwlessRemember")}
                        <small>{msgStr("pwlessRememberHint")}</small>
                    </span>
                </label>
                <button type="button" id="pwless-code-btn" disabled={pwlessBusy}>
                    {msgStr("pwlessCodeSubmit")}
                </button>
                <button type="button" id="pwless-code-resend" onClick={() => pwlessSend("resend")}
                        disabled={pwlessCooldown > 0}>
                    {pwlessCooldown > 0
                        ? msgStr("pwlessResendCodeIn", String(pwlessCooldown))
                        : msgStr("pwlessResendCode")}
                </button>
                {pwlessUsePasswordLink}
            </div>

            {/* DEVICE B — the page the link opens. The GET only verifies and draws this;
                the POST behind the button is what consumes the token (§3.8). Nothing else may. */}
            <div className="pwless-step" hidden={pwlessView !== "confirm"}>
                {pwlessMailIcon}
                <h2 className="pwless-title pwless-title--center">{msgStr("pwlessConfirmTitle")}</h2>
                <p className="pwless-intro pwless-intro--center">{msgStr("pwlessConfirmBody")}</p>
                <button type="button" id="pwless-confirm-btn">{msgStr("pwlessConfirmBtn")}</button>
                <span className="pwless-alt-link" role="link" tabIndex={0}>
                    {msgStr("pwlessConfirmDeny")}
                </span>
            </div>

            <div className="pwless-step" hidden={pwlessView !== "done"}>
                {pwlessMailIcon}
                <h2 className="pwless-title pwless-title--center">{msgStr("pwlessDoneTitle")}</h2>
                <p className="pwless-intro pwless-intro--center">{msgStr("pwlessDoneBody")}</p>
            </div>

            <p id="passwordless-status" role="status" aria-live="polite"
               className={"pwless-status pwless-status--" + pwlessState}
               hidden={!pwlessStatusText}>{pwlessStatusText}</p>
        </div>
    );

    const loginForm = useRef<HTMLFormElement | null>(null);
    const kcPasswordInput = useRef<HTMLInputElement | null>(null);
    const kcUsernameInput = useRef<HTMLInputElement | null>(null);
    const passwordInput = useRef<HTMLInputElement | null>(null);
    const usernameInput = useRef<HTMLInputElement | null>(null);
    const toggleShownBtn = useRef<HTMLDivElement | null>(null);
    const forgotPasswordKc = useRef<HTMLAnchorElement | null>(null);
    const capsWarningElement = useRef<HTMLSpanElement | null>(null);

    function updateUsernameField() {
        if (usernameInput.current && kcUsernameInput.current) {
            kcUsernameInput.current.value = usernameInput.current.value;
        }
    }

    function updatePasswordField() {
        if (passwordInput.current && kcPasswordInput.current) {
            kcPasswordInput.current.value = passwordInput.current.value;
        }
    }

    function toggleShownPassword() {
        if (passwordInput.current && toggleShownBtn.current) {
            toggleShownBtn.current.classList.toggle("fa-eye-slash");
            toggleShownBtn.current.classList.toggle("fa-eye");

            if (passwordInput.current.type === "password") {
                passwordInput.current.type = "text";
            } else {
                passwordInput.current.type = "password";
            }

        }
    }

    function triggerLoginSubmit() {
        if (loginForm.current && kcPasswordInput.current && kcUsernameInput.current && passwordInput.current && usernameInput.current) {
            if (kcPasswordInput.current.value != "" && kcUsernameInput.current.value != "") {
                // Submit keycloak Login form

                const shownSubmitBtn = document.getElementById("trigger-submit-btn") as HTMLDivElement | null;

                if (shownSubmitBtn) {
                    shownSubmitBtn.innerHTML = `<span id="spinner"></span>`;
                    shownSubmitBtn.classList.add("disabled");
                }

                // Add countrycode if numeric and submit
                if (isNumeric(usernameInput.current.value)) {
                    if (usernameInput.current.getAttribute("country-code")) {
                        const currUsername = usernameInput.current.value;
                        const prefix = usernameInput.current.getAttribute("country-code");

                        kcUsernameInput.current.value = prefix + currUsername;
                        loginForm.current.submit();
                        kcUsernameInput.current.value = currUsername;

                    }
                } else {
                    loginForm.current.submit();
                }

            } else if (kcPasswordInput.current.value == "" && kcUsernameInput.current.value != "") {
                passwordInput.current.focus();
            } else if (kcUsernameInput.current.value == "") {
                usernameInput.current.focus();
            } else {
                usernameInput.current.focus();
            }
        }
    }

    //If going to use keycloak forgot password, use this function
    // function triggerForgotPasswordNav() {
    //     if (forgotPasswordKc.current) {
    //         forgotPasswordKc.current.click();
    //     }
    // }

    //If going to use old forgot password, use this function
    function triggerOldForgotPassword() {
        const url = window.location.toString();

        if (url) {
            if (url.includes("demo.excite.cx") || url.includes("excitedemo.cx")) {
                window.location.href = "https://legacydemo.excite.cx/pmws.dll/gxl.forgotpassword?from_kc=true&client=demo";
            } else if (url.includes("api.excite.cx") || url.includes("excite.cx") && !url.includes("beholder")) {
                window.location.href = "https://excite.cx/pmws.dll/gxl.forgotpassword?from_kc=true&client=prod";
            } else {
                window.location.href = "http://localhost/gitekx/pmws.dll/gxl.forgotpassword?from_kc=true&client=local";
            }
        } else {
            window.location.href = "http://localhost/gitekx/pmws.dll/gxl.forgotpassword?from_kc=true&client=local";
        }
    }

    function isNumeric(n: string): boolean {
        return n !== '' && !isNaN(parseFloat(n)) && isFinite(Number(n));
    }

    function toggleCapsWarning(state: boolean) {
        if (capsWarningElement.current) {
            capsWarningElement.current.style.display = state ? 'block' : 'none';
        }
    }

    function keydownHandler(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            triggerLoginSubmit();
        } else {
            if (e.getModifierState("CapsLock")) {
                toggleCapsWarning(true);
            } else {
                toggleCapsWarning(false);
            }
        }
    }

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username", "password")}
            headerNode={msg("loginAccountTitle")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <div id="kc-registration-container">
                    <div id="kc-registration">
                        <span>
                            {msg("noAccount")}{" "}
                            <a tabIndex={8} href={url.registrationUrl}>
                                {msg("doRegister")}
                            </a>
                        </span>
                    </div>
                </div>
            }
            socialProvidersNode={
                /* Hidden on the passwordless screens: each of those is its own full step
                   (the note's screens 2 and 3), not the login form with something added. */
                <div className="pwless-hideable" hidden={hideCredentialForm}>
                    {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
                        <div id="kc-social-providers" className={kcClsx("kcFormSocialAccountSectionClass")}>
                            <hr/>
                            <div className={"social-providers-header-wrapper"}>
                                <div className={"heading-divider"}></div>
                                <span
                                    className={"social-providers-heading"}>{msg("identity-provider-login-label")}</span>
                                <div className={"heading-divider"}></div>
                            </div>
                            <ul className={kcClsx("kcFormSocialAccountListClass", social.providers.length > 3 && "kcFormSocialAccountListGridClass")}>
                                {social.providers.map((...[p, , providers]) => (
                                    <li key={p.alias}>
                                        <a
                                            id={`social-${p.alias}`}
                                            className={kcClsx(
                                                "kcFormSocialAccountListButtonClass",
                                                providers.length > 3 && "kcFormSocialAccountGridItem"
                                            )}
                                            type="button"
                                            href={p.loginUrl}
                                        >
                                            {p.iconClasses &&
                                                <i className={"fa-brands " + clsx(kcClsx("kcCommonLogoIdP"), p.iconClasses)}
                                                   aria-hidden="true"></i>}
                                            <span
                                                className={clsx(kcClsx("kcFormSocialAccountNameClass"), p.iconClasses && "kc-social-icon-text")}
                                                dangerouslySetInnerHTML={{__html: kcSanitize(p.displayName)}}
                                            ></span>
                                            {p.alias === lastUsedIdp && (
                                                <span className="social-lastused">{"\u00b7 " + msgStr("pwlessLastUsed")}</span>
                                            )}

                                        </a>
                                    </li>
                                ))}
                            </ul>
                            {/* Passordløs innlogging — entry point, BELOW the IdP buttons (§3.5). */}
                            {pwlessLink}
                        </div>
                    )}
                    {/* No IdPs configured: the link still has to appear. */}
                    {!(realm.password && social?.providers !== undefined && social.providers.length !== 0) && (
                        <div id="kc-social-providers" className={kcClsx("kcFormSocialAccountSectionClass")}>
                            {pwlessLink}
                        </div>
                    )}
                </div>
            }
        >
            {/*    Form shown to user on login*/}
            <div className="user-shown-form-login">

                {/* NB: hidden, never unmounted — see hideCredentialForm above. */}
                <div id={"username-wrapper"} hidden={hideCredentialForm}>
                    <input id={"shown-username-input"} ref={usernameInput} type={"text"} inputMode={"email"}
                           aria-label={msgStr("usernameOrEmail")}
                           placeholder={msgStr("usernameOrEmail")} onInput={updateUsernameField} onKeyDown={keydownHandler}/>
                </div>
                <div id={"password-wrapper"} hidden={hideCredentialForm}>
                    <input id={"shown-password-input"} ref={passwordInput} type={"password"}
                           aria-label={msgStr("password")}
                           placeholder={msgStr("password")} onInput={updatePasswordField} onKeyDown={keydownHandler}/>
                    <div id={"toggle-shown-password"} ref={toggleShownBtn} className={"fa-regular fa-eye-slash"}
                         onClick={toggleShownPassword}></div>
                    <span className={"caps-warning-message"} ref={capsWarningElement}>{msgStr("capsWarning")}</span>
                </div>
                {/* Moved up beside the password field (§3.5) — it belongs to the password, and
                    it frees the bottom of the form for the passwordless link. */}
                {/*{realm.resetPasswordAllowed && (*/}
                <span className={"trigger-forgot-password-btn forgot-password--inline"}
                      onClick={triggerOldForgotPassword} hidden={hideCredentialForm}>
                        {msgStr("doForgotPassword")}
                    </span>
                {/*)}*/}
                <div id={"trigger-submit-btn"} onClick={triggerLoginSubmit}
                     hidden={hideCredentialForm}>{msgStr("login")}</div>

                {/* Passordløs innlogging — entry is a TEXT LINK at the bottom (§3.5), so the page
                    keeps ONE primary button. The dedicated screen is a sibling of the credential
                    form, which is only hidden (never unmounted — intl-tel-input wraps its input
                    outside React's knowledge). */}
                {pwlessPage}
            </div>
            <div id="kc-form">
                <div id="kc-form-wrapper">
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            ref={loginForm}
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                        >
                            {!usernameHidden && (
                                <div className={kcClsx("kcFormGroupClass")}>
                                    <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                                        {!realm.loginWithEmailAllowed
                                            ? msg("username")
                                            : !realm.registrationEmailAsUsername
                                                ? msg("usernameOrEmail")
                                                : msg("email")}
                                    </label>
                                    <input
                                        tabIndex={2}
                                        id="username"
                                        ref={kcUsernameInput}
                                        className={kcClsx("kcInputClass")}
                                        name="username"
                                        defaultValue={login.username ?? ""}
                                        type="text"
                                        autoFocus
                                        autoComplete="username"
                                        aria-invalid={messagesPerField.existsError("username", "password")}
                                    />
                                    {messagesPerField.existsError("username", "password") && (
                                        <span
                                            id="input-error"
                                            className={kcClsx("kcInputErrorMessageClass")}
                                            aria-live="polite"
                                            dangerouslySetInnerHTML={{
                                                __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            <div className={kcClsx("kcFormGroupClass")}>
                                <label htmlFor="password" className={kcClsx("kcLabelClass")}>
                                    {msg("password")}
                                </label>
                                <PasswordWrapper kcClsx={kcClsx} i18n={i18n} passwordInputId="password">
                                    <input
                                        tabIndex={3}
                                        id="password"
                                        ref={kcPasswordInput}
                                        className={kcClsx("kcInputClass")}
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        aria-invalid={messagesPerField.existsError("username", "password")}
                                    />
                                </PasswordWrapper>
                                {usernameHidden && messagesPerField.existsError("username", "password") && (
                                    <span
                                        id="input-error"
                                        className={kcClsx("kcInputErrorMessageClass")}
                                        aria-live="polite"
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                        }}
                                    />
                                )}
                            </div>

                            <div className={kcClsx("kcFormGroupClass", "kcFormSettingClass")}>
                                <div id="kc-form-options">
                                    {realm.rememberMe && !usernameHidden && (
                                        <div className="checkbox">
                                            <label>
                                                <input
                                                    tabIndex={5}
                                                    id="rememberMe"
                                                    name="rememberMe"
                                                    type="checkbox"
                                                    defaultChecked={!!login.rememberMe}
                                                />{" "}
                                                {msg("rememberMe")}
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className={kcClsx("kcFormOptionsWrapperClass")}>
                                    {realm.resetPasswordAllowed && (
                                        <span>
                                            <a id={"forgot-password-kc"} ref={forgotPasswordKc} tabIndex={6}
                                               href={url.loginResetCredentialsUrl}>
                                                {msg("doForgotPassword")}
                                            </a>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div id="kc-form-buttons" className={kcClsx("kcFormGroupClass")}>
                                <input type="hidden" id="id-hidden-input" name="credentialId"
                                       value={auth.selectedCredential}/>
                                <input
                                    tabIndex={7}
                                    disabled={isLoginButtonDisabled}
                                    className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                                    name="login"
                                    id="kc-login"
                                    type="submit"
                                    value={msgStr("doLogIn")}
                                />
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Template>
    );
}

function PasswordWrapper(props: { kcClsx: KcClsx; i18n: I18n; passwordInputId: string; children: JSX.Element }) {
    const {kcClsx, i18n, passwordInputId, children} = props;

    const {msgStr} = i18n;

    const {isPasswordRevealed, toggleIsPasswordRevealed} = useIsPasswordRevealed({passwordInputId});

    return (
        <div className={kcClsx("kcInputGroup")}>
            {children}
            <button
                type="button"
                className={kcClsx("kcFormPasswordVisibilityButtonClass")}
                aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                aria-controls={passwordInputId}
                onClick={toggleIsPasswordRevealed}
            >
                <i className={kcClsx(isPasswordRevealed ? "kcFormPasswordVisibilityIconHide" : "kcFormPasswordVisibilityIconShow")}
                   aria-hidden/>
            </button>
        </div>
    );
}
