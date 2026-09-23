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

            // Confirmation — ALL THREE channels, identical for every request.
            // The DQ8 revision of 2026-09-23 reversed the earlier channel-specific wording:
            // naming the resolved channel conceded that the account exists, and this does not,
            // while still telling the user where to look. See plan §3.6.
            pwlessCheckAll: "Sjekk appen, e-posten eller SMS-en din",
            pwlessSending: "Sender …",
            pwlessSendingBody: "Vi finner ut hvor vi best får tak i deg.",
            pwlessTypoHint: "Fikk du ingenting? Sjekk søppelposten, og at du skrev riktig.",
            // "Hvis kontoen finnes" is shown to everyone. Under the earlier design it was hedging,
            // because the heading above had already conceded existence. It now does real work.
            pwlessSentToAll: "Hvis kontoen finnes, har vi sendt deg en lenke. Trykk på den, så logger vi deg inn her.",
            pwlessWaitingDot: "Venter på at du trykker på lenken",
            pwlessKeepOpen: "Du kan la denne siden stå åpen. Lenken virker i 10 minutter.",
            pwlessResend: "Send ny lenke",
            pwlessResendIn: "Send ny lenke om {0} s",

            // Resent — says out loud that the previous link is now dead, so nobody hunts for it.
            pwlessResentTitle: "Ny lenke er sendt",
            pwlessResentBody: "Se etter den nyeste. Den forrige lenken slutter å virke nå.",

            // Code path (DQ9) — an unproven device types a code instead of tapping a link.
            // §3.7 says this will be the COMMON path, not an edge case: cookies are lost to
            // private windows, new phones, cleared browsers and shared machines.
            pwlessCodeTitle: "Skriv inn koden",
            pwlessCodeIntro: "Hvis kontoen finnes, har vi sendt deg en sekssifret kode. Skriv den inn her.",
            pwlessCodeLabel: "Sekssifret kode",
            pwlessCodeSubmit: "Logg inn",
            pwlessCodeWrong: "Feil kode. Prøv igjen.",
            pwlessCodeSpent: "For mange forsøk. Be om en ny kode.",
            // The code screen resends a CODE, not a link — reusing pwlessResend here said "lenke"
            // on a screen that has none.
            pwlessResendCode: "Send ny kode",
            pwlessResendCodeIn: "Send ny kode om {0} s",
            pwlessRemember: "Husk denne enheten",
            pwlessRememberHint: "Neste gang holder det å trykke på en lenke.",

            // Device B — the confirm page the link opens. The POST here is what consumes the
            // token; the GET only verifies and draws (plan §3.8). Nothing else may consume it.
            pwlessConfirmTitle: "Logg inn på Excite?",
            pwlessConfirmBody: "Noen har bedt om å logge inn. Var det deg, trykker du på knappen under.",
            pwlessConfirmBtn: "Ja, logg meg inn",
            pwlessConfirmDeny: "Nei, det var ikke meg",
            pwlessDoneTitle: "Du er logget inn",
            pwlessDoneBody: "Gå tilbake til skjermen der du startet. Den fortsetter av seg selv.",

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
