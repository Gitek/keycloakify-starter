/* eslint-disable @typescript-eslint/no-unused-vars */
import {i18nBuilder} from "keycloakify/login";
import type {ThemeName} from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const {useI18n, ofTypeI18n} = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        no: {
            usernameOrEmail: "Mobilnummer",
            password: "Passord",
            doForgotPassword: "Glemt passord?",
            rememberMe: "Husk meg",
            login: "Logg inn",
            "identity-provider-login-label": "Eller",
            newPassword: "Nytt passord",
            backToLogin: "Tilbake til innlogging",
            changePassword: "Endre passord",
            passwordConfirm: "Bekreft nytt passord",
            passwordNew: "Nytt passord",
            logoutOtherSessions: "Logg ut fra andre enheter",
            doCancel: "Avbryt",
        }
    }).build();

type I18n = typeof ofTypeI18n;

export {useI18n, type I18n};
