/* eslint-disable @typescript-eslint/no-unused-vars */
import {i18nBuilder} from "keycloakify/login";
import type {ThemeName} from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const {useI18n, ofTypeI18n} = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        no: {
            usernameOrEmail: "Brukernavn",
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
            capsWarning: "Caps Lock er på",
            // --- Passordløs innlogging (magic link) — Phase 0 copy deck, for review ---
            pwlessButton: "Logg inn uten passord",
            pwlessIntro: "Vi sender deg en lenke som logger deg inn.",
            pwlessFieldLabel: "E-post eller mobilnummer",
            pwlessSendLink: "Send lenke",
            pwlessCheckEmail: "Sjekk e-posten din",
            pwlessCheckSms: "Sjekk SMS-en din",
            pwlessCheckPush: "Sjekk appen din",
            // Full address, not masked: we echo back what the user just typed, so it reveals
            // nothing they don't already know — and a typo is the #1 reason the link never arrives.
            pwlessSentTo: "Vi sendte en lenke til",
            pwlessValidFor: "Lenken er gyldig i 10 minutter.",
            pwlessWaiting: "Venter på at du åpner lenken …",
            pwlessWaitingHint: "Åpne lenken på enheten der du mottok den. Du blir logget inn her.",
            pwlessMissingIdentifier: "Fyll inn e-post eller mobilnummer.",
            pwlessInvalid: "Skriv inn en gyldig e-postadresse eller et mobilnummer.",
            pwlessResend: "Send på nytt",
            pwlessResendIn: "Send på nytt om {0} s",
            pwlessExpired: "Lenken er utløpt. Send en ny.",
            pwlessError: "Noe gikk galt. Prøv igjen.",
            pwlessRateLimited: "For mange forsøk. Vent litt før du prøver igjen.",
            pwlessCancel: "Avbryt",
            // Recovery — "den viktigste skjermen i hele flyten". Never a dead end.
            pwlessRecoveryTitle: "Lenken virker ikke lenger",
            pwlessRecoveryIntro: "Lenker er gyldige i 10 minutter, og kan bare brukes én gang. Vi sender deg en ny.",
            pwlessRecoverySend: "Send ny lenke",
            pwlessLastUsed: "sist brukt"
        }
    }).build();

type I18n = typeof ofTypeI18n;

export {useI18n, type I18n};
