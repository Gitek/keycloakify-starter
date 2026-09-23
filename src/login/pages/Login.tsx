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
    // Stories force a state via kcContext.pwlessMock / pwlessView / pwlessChannel.
    // Phase 5 replaces the mock handler with a POST to url.loginAction.
    //
    // Follows plan §3.5 (Beslutningsnotat): entry is a TEXT LINK at the bottom, the address is
    // shown in FULL, the link lives 10 minutes, resend unlocks after 45 s, and an expired link
    // lands on its own recovery screen rather than a dead end.
    // ---------------------------------------------------------------------------
    type PwlessState = "idle" | "missing" | "invalid" | "sending" | "waiting" | "expired" | "error" | "ratelimited";
    /** Which screen we're on. "off" = the normal login form. */
    type PwlessView = "off" | "request" | "sent" | "recovery";
    /** Which channel the message went out on. Server-decided in Phase 4 (§3.4) — mocked here. */
    type PwlessChannel = "push" | "email" | "sms";

    const pwlessMock = (kcContext as any).pwlessMock as PwlessState | undefined;
    const pwlessMockView = (kcContext as any).pwlessView as PwlessView | undefined;
    const pwlessMockChannel = (kcContext as any).pwlessChannel as PwlessChannel | undefined;

    const PWLESS_RESEND_SECONDS = 45;

    const [pwlessView, setPwlessView] = useState<PwlessView>(pwlessMockView ?? "off");
    const [pwlessState, setPwlessState] = useState<PwlessState>(pwlessMock ?? "idle");
    const [pwlessCooldown, setPwlessCooldown] = useState(pwlessMockView === "sent" ? 41 : 0);
    const [pwlessIdentifier, setPwlessIdentifier] = useState<string>(
        ((kcContext as any).pwlessIdentifier as string | undefined) ?? "");
    const pwlessFieldRef = useRef<HTMLInputElement | null>(null);

    /**
     * MOCK channel choice. In production this is NOT ours to make: the plugin hands the user's
     * contact facts to communication-service, which resolves push → email → SMS and applies the
     * per-enterprise SMS greenlight, then reports back which channel it used (plan §3.4).
     * Here we only need something plausible to render, so: whatever the story forces, else
     * email if it looks like an address, else SMS.
     */
    const pwlessChannel: PwlessChannel =
        pwlessMockChannel ?? (pwlessIdentifier.includes("@") ? "email" : "sms");

    const pwlessCheckHeading =
        pwlessChannel === "push" ? msgStr("pwlessCheckPush")
            : pwlessChannel === "email" ? msgStr("pwlessCheckEmail")
                : msgStr("pwlessCheckSms");

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

    /** Entry link is pure navigation — no validation here. */
    function pwlessOpen() {
        setPwlessIdentifier(usernameInput.current?.value?.trim() ?? "");
        setPwlessState("idle");
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

    function pwlessSend() {
        // MOCK: nothing is sent. Mirrors the real states so the flow can be judged.
        const typed = (pwlessFieldRef.current?.value ?? pwlessIdentifier).trim();
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
            setPwlessView("sent");
            pwlessStartCooldown();
        }, 700);
    }

    /** Recovery screen: the address is already known, so this is one button. */
    function pwlessRecoverySend() {
        setPwlessState("sending");
        window.setTimeout(() => {
            setPwlessState("waiting");
            setPwlessView("sent");
            pwlessStartCooldown();
        }, 700);
    }

    function pwlessCancel() {
        setPwlessView("off");
        setPwlessState("idle");
        setPwlessCooldown(0);
    }

    const pwlessBusy = pwlessState === "sending";
    // The credential form stays MOUNTED at all times (intl-tel-input wraps #shown-username-input
    // in a .iti div outside React's knowledge — unmounting it throws NotFoundError). Hide, never unmount.
    const hideCredentialForm = pwlessView !== "off";

    // "expired" is no longer an inline message — it is its own screen (§3.5).
    const pwlessStatusText =
        pwlessState === "missing" ? msgStr("pwlessMissingIdentifier")
            : pwlessState === "invalid" ? msgStr("pwlessInvalid")
                : pwlessState === "ratelimited" ? msgStr("pwlessRateLimited")
                    : pwlessState === "error" ? msgStr("pwlessError")
                        : "";

    /**
     * Which IdP to mark "· sist brukt". Phase 5 reads this from a cookie the server sets;
     * for the mock it comes from the story, falling back to a local note if one exists.
     */
    const lastUsedIdp: string | undefined =
        ((kcContext as any).lastUsedIdp as string | undefined) ??
        (typeof window !== "undefined" ? window.localStorage?.getItem("excite.lastIdp") ?? undefined : undefined);

    /** The login-page entry point — a text link at the bottom, NOT a second button (§3.5). */
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

    /** The dedicated passwordless screen: ask → confirm, plus recovery. */
    const pwlessPage = (
        <div id="pwless-page" hidden={pwlessView === "off"}>
            <p className="pwless-intro" hidden={pwlessView === "recovery"}>{msgStr("pwlessIntro")}</p>

            {/* STEP 1 — ask */}
            <div className="pwless-step" hidden={pwlessView !== "request"}>
                <div id="pwless-field-wrapper">
                    <input id="pwless-username-input" ref={pwlessFieldRef} data-iti-input
                           type="text" inputMode="email"
                           aria-label={msgStr("pwlessFieldLabel")}
                           placeholder={msgStr("pwlessFieldLabel")}
                           defaultValue={pwlessIdentifier}/>
                </div>
                <button type="button" id="pwless-send-btn" onClick={pwlessSend}
                        disabled={pwlessBusy} aria-busy={pwlessBusy}>
                    {msgStr("pwlessSendLink")}
                </button>
            </div>

            {/* STEP 2 — confirm. The address is shown IN FULL: it is what the user just typed,
                so it reveals nothing, and a typo is the commonest reason the link never lands. */}
            <div className="pwless-step" hidden={pwlessView !== "sent"}>
                <div className="pwless-spinner" aria-hidden="true"/>
                <p className="pwless-check">{pwlessCheckHeading}</p>
                <p className="pwless-sent-to">
                    {msgStr("pwlessSentTo")}{" "}
                    <span className="pwless-address">{pwlessIdentifier}</span>
                </p>
                <p className="pwless-waiting-hint">{msgStr("pwlessWaitingHint")}</p>
                <p className="pwless-validity">{msgStr("pwlessValidFor")}</p>
                <button type="button" id="pwless-resend-btn" onClick={pwlessSend}
                        disabled={pwlessCooldown > 0}>
                    {pwlessCooldown > 0
                        ? msgStr("pwlessResendIn", String(pwlessCooldown))
                        : msgStr("pwlessResend")}
                </button>
            </div>

            {/* RECOVERY — reached from an expired or already-used link. Address pre-filled,
                one button. Never a dead end (§3.5). */}
            <div className="pwless-step" hidden={pwlessView !== "recovery"}>
                <p className="pwless-recovery-title">{msgStr("pwlessRecoveryTitle")}</p>
                <p className="pwless-recovery-intro">{msgStr("pwlessRecoveryIntro")}</p>
                <div id="pwless-recovery-address" className="pwless-address">{pwlessIdentifier}</div>
                <button type="button" id="pwless-recovery-btn" onClick={pwlessRecoverySend}
                        disabled={pwlessBusy} aria-busy={pwlessBusy}>
                    {msgStr("pwlessRecoverySend")}
                </button>
            </div>

            <p id="passwordless-status" role="status" aria-live="polite"
               className={"pwless-status pwless-status--" + pwlessState}
               hidden={!pwlessStatusText}>{pwlessStatusText}</p>

            <span className="trigger-forgot-password-btn pwless-cancel"
                  onClick={pwlessCancel}>{msgStr("backToLogin")}</span>
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
                <>
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
                        </div>
                    )}
                </>
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
                {pwlessLink}
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
