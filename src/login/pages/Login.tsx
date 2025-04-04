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

    const loginForm = useRef<HTMLFormElement | null>(null);
    const kcPasswordInput = useRef<HTMLInputElement | null>(null);
    const kcUsernameInput = useRef<HTMLInputElement | null>(null);
    const passwordInput = useRef<HTMLInputElement | null>(null);
    const usernameInput = useRef<HTMLInputElement | null>(null);
    const toggleShownBtn = useRef<HTMLDivElement | null>(null);
    const forgotPasswordKc = useRef<HTMLAnchorElement | null>(null);

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

                // Add countrycode if numeric and submit
                if (isNumeric(usernameInput.current.value)) {
                    if (usernameInput.current.getAttribute("country-code")) {
                        let currUsername = usernameInput.current.value;
                        let prefix = usernameInput.current.getAttribute("country-code");

                        kcUsernameInput.current.value = prefix + currUsername;
                    }
                }

                loginForm.current.submit();

            } else if (kcPasswordInput.current.value == "" && kcUsernameInput.current.value != "") {
                passwordInput.current.focus();
            } else if (kcUsernameInput.current.value == "") {
                usernameInput.current.focus();
            } else {
                usernameInput.current.focus();
            }
        }
    }

    function triggerForgotPasswordNav() {
        if (forgotPasswordKc.current) {
            forgotPasswordKc.current.click();
        }
    }

    function isNumeric(n: string): boolean {
        return n !== '' && !isNaN(parseFloat(n)) && isFinite(Number(n));
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

                <div id={"username-wrapper"}>
                    <input id={"shown-username-input"} ref={usernameInput} type={"username"}
                           placeholder={msgStr("usernameOrEmail")} onInput={updateUsernameField}/>
                </div>
                <div id={"password-wrapper"}>
                    <input id={"shown-password-input"} ref={passwordInput} type={"password"}
                           placeholder={msgStr("password")} onInput={updatePasswordField}/>
                    <div id={"toggle-shown-password"} ref={toggleShownBtn} className={"fa-regular fa-eye-slash"}
                         onClick={toggleShownPassword}></div>
                </div>
                <div id={"trigger-submit-btn"} onClick={triggerLoginSubmit}>{msgStr("login")}</div>
                {realm.resetPasswordAllowed && (
                    <span className={"trigger-forgot-password-btn"} onClick={triggerForgotPasswordNav}>
                        {msgStr("doForgotPassword")}
                    </span>
                )}
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
