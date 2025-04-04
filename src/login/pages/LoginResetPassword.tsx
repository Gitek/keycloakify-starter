import {useRef} from "react";
import {getKcClsx} from "keycloakify/login/lib/kcClsx";
import {kcSanitize} from "keycloakify/lib/kcSanitize";
import type {PageProps} from "keycloakify/login/pages/PageProps";
import type {KcContext} from "../KcContext";
import type {I18n} from "../i18n";

// This file is for the reset password page specifically.
// The reset password form is the main element in this file, this includes an input field and a back to login button.

export default function LoginResetPassword(props: PageProps<Extract<KcContext, {
    pageId: "login-reset-password.ftl"
}>, I18n>) {
    const {kcContext, i18n, doUseDefaultCss, Template, classes} = props;

    const {kcClsx} = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const {url, realm, auth, messagesPerField} = kcContext;

    const {msg, msgStr} = i18n;

    const resetPassForm = useRef<HTMLFormElement | null>(null);
    const kcUsernameInput = useRef<HTMLInputElement | null>(null);
    const usernameInput = useRef<HTMLInputElement | null>(null);
    const backToLoginKc = useRef<HTMLAnchorElement | null>(null);

    function updateKcFormForPassReset() {
        if (usernameInput.current && kcUsernameInput.current) {
            kcUsernameInput.current.value = usernameInput.current.value;
        }
    }

    function triggerResetPassSubmit() {
        if (resetPassForm.current && kcUsernameInput.current && usernameInput.current) {
            if (kcUsernameInput.current.value != "") {
                // Submit keycloak reset password form

                // Add countrycode if numeric and submit
                if (isNumeric(usernameInput.current.value)) {
                    if (usernameInput.current.getAttribute("country-code")) {
                        let currUsername = usernameInput.current.value;
                        let prefix = usernameInput.current.getAttribute("country-code");

                        kcUsernameInput.current.value = prefix + currUsername;
                    }
                }

                resetPassForm.current.submit();

            } else if (kcUsernameInput.current.value == "") {
                usernameInput.current.focus();
            }
        }
    }

    function backToLogin() {
        if (backToLoginKc.current) {
            backToLoginKc.current.click();
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
            displayInfo
            displayMessage={!messagesPerField.existsError("username")}
            infoNode={realm.duplicateEmailsAllowed ? msg("emailInstructionUsername") : msg("emailInstruction")}
            headerNode={msg("emailForgotTitle")}
        >
            {/*    Form shown to user on reset password*/}
            <div className="user-shown-form-reset-password">
                <h1 className={"user-shown-form-heading"}>{msgStr("doForgotPassword")}</h1>
                <div id={"username-wrapper"}>
                    <input id={"reset-pass-username-input"} ref={usernameInput} type={"username"}
                           placeholder={msgStr("usernameOrEmail")} onInput={updateKcFormForPassReset}/>
                </div>

                <div id={"trigger-reset-pass-submit-btn"} onClick={triggerResetPassSubmit}>{msgStr("newPassword")}</div>
                <div id={"back-to-login-btn"} onClick={backToLogin}>{msgStr("backToLogin")}</div>
            </div>
            <form id="kc-reset-password-form" ref={resetPassForm} className={kcClsx("kcFormClass")}
                  action={url.loginAction} method="post">
                <div className={kcClsx("kcFormGroupClass")}>
                    <div className={kcClsx("kcLabelWrapperClass")}>
                        <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                            {!realm.loginWithEmailAllowed
                                ? msg("username")
                                : !realm.registrationEmailAsUsername
                                    ? msg("usernameOrEmail")
                                    : msg("email")}
                        </label>
                    </div>
                    <div className={kcClsx("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="username"
                            ref={kcUsernameInput}
                            name="username"
                            className={kcClsx("kcInputClass")}
                            autoFocus
                            defaultValue={auth.attemptedUsername ?? ""}
                            aria-invalid={messagesPerField.existsError("username")}
                        />
                        {messagesPerField.existsError("username") && (
                            <span
                                id="input-error-username"
                                className={kcClsx("kcInputErrorMessageClass")}
                                aria-live="polite"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(messagesPerField.get("username"))
                                }}
                            />
                        )}
                    </div>
                </div>
                <div className={kcClsx("kcFormGroupClass", "kcFormSettingClass")}>
                    <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
                        <div className={kcClsx("kcFormOptionsWrapperClass")}>
                            <span>
                                <a id={"kc-back-to-login"} ref={backToLoginKc}
                                   href={url.loginUrl}>{msg("backToLogin")}</a>
                            </span>
                        </div>
                    </div>

                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <input
                            className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                            type="submit"
                            value={msgStr("doSubmit")}
                        />
                    </div>
                </div>
            </form>
        </Template>
    );
}
