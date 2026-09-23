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
            // --- Passordløs innlogging (magic link) — Phase 0 copy deck ---
            // Wording follows Khai's Beslutningsnotat screens. Where the note says "e-post"
            // we stay channel-neutral, because the channel is server-decided (plan §3.4)
            // and unknown at the point the user is asked.
            pwlessButton: "Logg inn uten passord",
            pwlessTitle: "Logg inn uten passord",
            pwlessIntro: "Vi sender deg en lenke. Trykk på den, så er du inne. Ingenting å huske.",
            pwlessFieldLabel: "E-post eller mobilnummer",
            pwlessFieldHint: "E-posten eller mobilnummeret ditt",
            pwlessSendLink: "Send lenke",
            pwlessBack: "Tilbake",
            pwlessUsePassword: "Logg inn med passord i stedet",
            pwlessChangeAddress: "Endre adresse",

            // Confirmation
            pwlessCheckEmail: "Sjekk e-posten din",
            pwlessCheckSms: "Sjekk SMS-en din",
            pwlessCheckPush: "Sjekk appen din",
            // The CHANNEL, never the address (DQ8 / plan §3.6). Enough to know where to look;
            // an address would let anyone with a phone list harvest the email behind it.
            pwlessSending: "Sender lenke …",
            pwlessSendingBody: "Vi finner ut hvor vi best får tak i deg.",
            pwlessTypoHint: "Fikk du ingenting? Sjekk at du skrev riktig, og prøv igjen.",
            // "Hvis kontoen finnes" is shown to everyone, existing or not. It does NOT restore the
            // uniform response — the channel above still varies — but it is honest, and it is the
            // only thing on the screen that explains a typo to the person who made one.
            pwlessSentToEmail: "Hvis kontoen finnes, har vi sendt deg en lenke dit. Trykk på knappen i e-posten, så logger vi deg inn her.",
            pwlessSentToSms: "Hvis kontoen finnes, har vi sendt deg en lenke dit. Trykk på lenken i meldingen, så logger vi deg inn her.",
            pwlessSentToPush: "Hvis kontoen finnes, har vi sendt deg et varsel. Trykk på det, så logger vi deg inn her.",
            pwlessWaitingDot: "Venter på at du trykker på lenken",
            pwlessKeepOpen: "Du kan la denne siden stå åpen. Lenken virker i 10 minutter.",
            pwlessResend: "Send ny lenke",
            pwlessResendIn: "Send ny lenke om {0} s",

            // Resent — says out loud that the previous link is now dead, so nobody hunts for it.
            pwlessResentTitle: "Ny lenke er sendt",
            pwlessResentBody: "Se etter den nyeste. Den forrige lenken slutter å virke nå.",

            // Recovery — "den viktigste skjermen i hele flyten". Never a dead end.
            pwlessRecoveryTitle: "Lenken virker ikke lenger",
            pwlessRecoveryIntro: "Lenker varer i 10 minutter og kan bare brukes én gang. Vi sender deg en ny med det samme.",
            pwlessRecoverySend: "Send ny lenke",

            // Errors
            pwlessMissingIdentifier: "Fyll inn e-post eller mobilnummer.",
            pwlessInvalid: "Skriv inn en gyldig e-postadresse eller et mobilnummer.",
            pwlessError: "Noe gikk galt. Prøv igjen.",
            pwlessRateLimited: "For mange forsøk. Vent litt før du prøver igjen.",
            pwlessLastUsed: "sist brukt"
        }
    }).build();

type I18n = typeof ofTypeI18n;

export {useI18n, type I18n};
