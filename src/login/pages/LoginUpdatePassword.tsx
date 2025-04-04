import type {JSX} from "keycloakify/tools/JSX";
import {useRef} from "react";
import {useIsPasswordRevealed} from "keycloakify/tools/useIsPasswordRevealed";
import {kcSanitize} from "keycloakify/lib/kcSanitize";
import {getKcClsx, type KcClsx} from "keycloakify/login/lib/kcClsx";
import type {PageProps} from "keycloakify/login/pages/PageProps";
import type {KcContext} from "../KcContext";
import type {I18n} from "../i18n";

// This file is for the update password page specifically.
// The update password form is the main element in this file

export default function LoginUpdatePassword(props: PageProps<Extract<KcContext, {
    pageId: "login-update-password.ftl"
}>, I18n>) {
    const {kcContext, i18n, doUseDefaultCss, Template, classes} = props;

    const {kcClsx} = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const {msg, msgStr} = i18n;

    const {url, messagesPerField, isAppInitiatedAction} = kcContext;

    const updatePassForm = useRef<HTMLFormElement | null>(null);
    const kcPasswordInput = useRef<HTMLInputElement | null>(null);
    const kcPasswordConfirmInput = useRef<HTMLInputElement | null>(null);
    const passwordInput = useRef<HTMLInputElement | null>(null);
    const passwordConfirmInput = useRef<HTMLInputElement | null>(null);
    const showPasswordBtn = useRef<HTMLDivElement | null>(null);
    const showPasswordConfirmBtn = useRef<HTMLDivElement | null>(null);
    const cancelUpdateKcBtn = useRef<HTMLButtonElement | null>(null);

    function updatePasswordField() {
        if (passwordInput.current && kcPasswordInput.current) {
            kcPasswordInput.current.value = passwordInput.current.value;
        }
    }

    function updatePasswordConfirmField() {
        if (passwordConfirmInput.current && kcPasswordConfirmInput.current) {
            kcPasswordConfirmInput.current.value = passwordConfirmInput.current.value;
        }
    }

    function toggleShownPassword() {
        if (passwordInput.current && showPasswordBtn.current) {
            showPasswordBtn.current.classList.toggle("fa-eye-slash");
            showPasswordBtn.current.classList.toggle("fa-eye");

            if (passwordInput.current.type === "password") {
                passwordInput.current.type = "text";
            } else {
                passwordInput.current.type = "password";
            }
        }
    }

    function toggleShownPasswordConfirm() {
        if (passwordConfirmInput.current && showPasswordConfirmBtn.current) {
            showPasswordConfirmBtn.current.classList.toggle("fa-eye-slash");
            showPasswordConfirmBtn.current.classList.toggle("fa-eye");

            if (passwordConfirmInput.current.type === "password") {
                passwordConfirmInput.current.type = "text";
            } else {
                passwordConfirmInput.current.type = "password";
            }
        }
    }

    function triggerUpdatePassSubmit() {
        if (updatePassForm.current && kcPasswordInput.current && kcPasswordConfirmInput.current && passwordInput.current && passwordConfirmInput.current) {
            if (kcPasswordInput.current.value != "" && kcPasswordConfirmInput.current.value != "") {
                // Submit keycloak update password form
                updatePassForm.current.submit();
            } else if (kcPasswordInput.current.value == "") {
                passwordInput.current.focus();
            } else if (kcPasswordConfirmInput.current.value == "") {
                passwordConfirmInput.current.focus();
            }
        }
    }

    function triggerCancelUpdate() {
        if (cancelUpdateKcBtn.current) {
            cancelUpdateKcBtn.current.click();
        }
    }

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("password", "password-confirm")}
            headerNode={msg("updatePasswordTitle")}
        >
            {/*    Form shown to user on update password*/}
            <div className="user-shown-form-login">
                {/*<p>{msgStr("passwordNew")}</p>*/}
                <h1 className={"user-shown-form-heading"}>{msgStr("changePassword")}</h1>
                <span className={"user-shown-input-label"}>{msgStr("passwordNew")}</span>
                <div id={"password-wrapper"}>
                    <input id={"shown-password-input"} ref={passwordInput} type={"password"}
                           onInput={updatePasswordField}/>
                    <div id={"toggle-shown-password"} ref={showPasswordBtn} className={"fa-regular fa-eye-slash"}
                         onClick={toggleShownPassword}></div>
                </div>
                {/*<p>{msgStr("passwordConfirm")}</p>*/}
                <span className={"user-shown-input-label"}>{msgStr("passwordConfirm")}</span>
                <div id={"password-confirm-wrapper"}>
                    <input id={"shown-password-confirm-input"} ref={passwordConfirmInput} type={"password"}
                           onInput={updatePasswordConfirmField}/>
                    <div id={"toggle-shown-password"} ref={showPasswordConfirmBtn} className={"fa-regular fa-eye-slash"}
                         onClick={toggleShownPasswordConfirm}></div>
                </div>
                <LogoutOtherSessions kcClsx={kcClsx} i18n={i18n}/>
                <div className={"btns-wrapper"}>
                    {isAppInitiatedAction && (
                        <button
                            id={"cancel-password-update-btn"}
                            className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonLargeClass")}
                            type="submit"
                            name="cancel-aia"
                            value="true"
                            onClick={triggerCancelUpdate}
                        >
                            {msg("doCancel")}
                        </button>
                    )}
                    <div id={"trigger-submit-btn"} onClick={triggerUpdatePassSubmit}>{msgStr("changePassword")}</div>
                </div>
            </div>
            <form id="kc-passwd-update-form" ref={updatePassForm} className={kcClsx("kcFormClass")}
                  action={url.loginAction} method="post">
                <div className={kcClsx("kcFormGroupClass")}>
                    <div className={kcClsx("kcLabelWrapperClass")}>
                        <label htmlFor="password-new" className={kcClsx("kcLabelClass")}>
                            {msg("passwordNew")}
                        </label>
                    </div>
                    <div className={kcClsx("kcInputWrapperClass")}>
                        <PasswordWrapper kcClsx={kcClsx} i18n={i18n} passwordInputId="password-new">
                            <input
                                type="password"
                                id="password-new"
                                ref={kcPasswordInput}
                                name="password-new"
                                className={kcClsx("kcInputClass")}
                                autoFocus
                                autoComplete="new-password"
                                aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                            />
                        </PasswordWrapper>

                        {messagesPerField.existsError("password") && (
                            <span
                                id="input-error-password"
                                className={kcClsx("kcInputErrorMessageClass")}
                                aria-live="polite"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(messagesPerField.get("password"))
                                }}
                            />
                        )}
                    </div>
                </div>

                <div className={kcClsx("kcFormGroupClass")}>
                    <div className={kcClsx("kcLabelWrapperClass")}>
                        <label htmlFor="password-confirm" className={kcClsx("kcLabelClass")}>
                            {msg("passwordConfirm")}
                        </label>
                    </div>
                    <div className={kcClsx("kcInputWrapperClass")}>
                        <PasswordWrapper kcClsx={kcClsx} i18n={i18n} passwordInputId="password-confirm">
                            <input
                                type="password"
                                id="password-confirm"
                                ref={kcPasswordConfirmInput}
                                name="password-confirm"
                                className={kcClsx("kcInputClass")}
                                autoFocus
                                autoComplete="new-password"
                                aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                            />
                        </PasswordWrapper>

                        {messagesPerField.existsError("password-confirm") && (
                            <span
                                id="input-error-password-confirm"
                                className={kcClsx("kcInputErrorMessageClass")}
                                aria-live="polite"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(messagesPerField.get("password-confirm"))
                                }}
                            />
                        )}
                    </div>
                </div>
                <div className={kcClsx("kcFormGroupClass")}>
                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <input
                            className={kcClsx(
                                "kcButtonClass",
                                "kcButtonPrimaryClass",
                                !isAppInitiatedAction && "kcButtonBlockClass",
                                "kcButtonLargeClass"
                            )}
                            type="submit"
                            value={msgStr("doSubmit")}
                        />
                        {isAppInitiatedAction && (
                            <button
                                className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonLargeClass")}
                                ref={cancelUpdateKcBtn}
                                type="submit"
                                name="cancel-aia"
                                value="true"
                            >
                                {msg("doCancel")}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </Template>
    );
}

function LogoutOtherSessions(props: { kcClsx: KcClsx; i18n: I18n }) {
    const {kcClsx, i18n} = props;

    const {msg} = i18n;

    return (
        <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
            <div className={kcClsx("kcFormOptionsWrapperClass")}>
                <div id={"logout-sessions-checkbox-wrapper"} className="checkbox">
                    <label>
                        <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on"
                               defaultChecked={true}/>
                        {msg("logoutOtherSessions")}
                    </label>
                </div>
            </div>
        </div>
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
