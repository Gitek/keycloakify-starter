import {Suspense, lazy} from "react";
import type {ClassKey} from "keycloakify/login";
import type {KcContext} from "./KcContext";
import {useI18n} from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "./Template";
import "./main.css";

const Login = lazy(
    () => import("./pages/Login")
);
const LoginResetPassword = lazy(
    () => import("./pages/LoginResetPassword")
);
const LoginUpdatePassword = lazy(
    () => import("./pages/LoginUpdatePassword")
);
const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);
const LoginIdpLinkConfirm = lazy(
    () => import("./pages/LoginIdpLinkConfirm")
);
const IdpReviewUserProfile = lazy(
    () => import("./pages/IdpReviewUserProfile")
);
const LoginPageExpired = lazy(
    () => import("./pages/LoginPageExpired")
);
const LoginIdpLinkEmail = lazy(
    () => import("./pages/LoginIdpLinkEmail")
);
const Error = lazy(
    () => import("./pages/Error")
);
const SelectAuthenticator = lazy(
    () => import("./pages/SelectAuthenticator")
);

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
    const {kcContext} = props;

    const {i18n} = useI18n({kcContext});

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return (
                            <Login
                                {...{kcContext, i18n, classes}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-reset-password.ftl":
                        return (
                            <LoginResetPassword
                                {...{kcContext, i18n, classes}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-update-password.ftl":
                        return (
                            <LoginUpdatePassword
                                {...{kcContext, i18n, classes}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-idp-link-confirm.ftl":
                        return (
                            <LoginIdpLinkConfirm
                                {...{kcContext, i18n, classes}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "idp-review-user-profile.ftl":
                        return (
                            <IdpReviewUserProfile
                                {...{kcContext, i18n, classes}}
                                Template={Template}
                                doUseDefaultCss={false}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                    case "login-page-expired.ftl":
                        return (
                            <LoginPageExpired
                                {...{kcContext, i18n, classes}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-idp-link-email.ftl":
                        return (
                            <LoginIdpLinkEmail
                                {...{kcContext, i18n, classes}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "error.ftl":
                        return (
                            <Error
                                {...{kcContext, i18n, classes}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "select-authenticator.ftl":
                        return (
                            <SelectAuthenticator
                                {...{kcContext, i18n, classes}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={false}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };
