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
            confirmLinkIdpReviewProfile: "Se gjennom konto",
            confirmLinkIdpContinue: "Legg til i eksisterende konto",
            username: "Brukernavn",
            email: "E-post",
            firstName: "Fornavn",
            lastName: "Etternavn",
            doSubmit: "Send inn",
            loginIdpReviewProfileTitle: "Oppdater kontoinformasjon",
            doClickHere: "Klikk her",
            pageExpiredMsg1: "For å starte login prosessen på nytt",
            pageExpiredMsg2: "For å fortsette login prosessen",
            pageExpiredTitle: "Siden har utløpt",
            confirmLinkIdpTitle: "Brukerkontoen finnes fra før",
            emailLinkIdpTitle: "Koble til {0}",
            emailLinkIdp1: "En e-post med instruksjoner for å koble sammen {0}-kontoen {1} med din {2}-konto har blitt sendt til deg.",
            emailLinkIdp2: "Har du ikke mottatt en verifiseringskode på e-posten din?",
            emailLinkIdp3: "for å sende e-posten på nytt.",
            emailLinkIdp4: "Hvis du allerede har bekreftet e-posten i en annen nettleser",
            emailLinkIdp5: "for å fortsette.",
            doTryAnotherWay: "Prøv en annen måte",
            backToApplication: "Tilbake til applikasjon",
            errorTitle: "Vi beklager...",
            loginChooseAuthenticator: "Velg påloggingsmetode",
            capsWarning: "Caps Lock er på"
        }
    }).build();

type I18n = typeof ofTypeI18n;

export {useI18n, type I18n};
