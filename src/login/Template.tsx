import {useEffect, useRef} from "react";
import {clsx} from "keycloakify/tools/clsx";
import {kcSanitize} from "keycloakify/lib/kcSanitize";
import type {TemplateProps} from "keycloakify/login/TemplateProps";
import {getKcClsx} from "keycloakify/login/lib/kcClsx";
import {useSetClassName} from "keycloakify/tools/useSetClassName";
import {useInitialize} from "keycloakify/login/Template.useInitialize";
import type {I18n} from "./i18n";
import type {KcContext} from "./KcContext";
import logoSvgUrl from "./assets/X_with_payoff_login_new.svg";
import smallLogoSvgUrl from "./assets/RetailX_NEG_RGB.svg";
import appQR from "./assets/onelinkto_ypkxzx_white.svg";
import appStoreImg from "./assets/app-store-badge.svg";
import playStoreImg from "./assets/google-play-badge.png";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

// This file is for elements that show up on all pages.
// The footer and logo are the main elements declared here
// Intl-tel and iziToast plugins are initialized and handled here

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        // documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    const {kcClsx} = getKcClsx({doUseDefaultCss, classes});

    const {msg, msgStr, currentLanguage, enabledLanguages} = i18n;

    const {auth, url, message, isAppInitiatedAction, messagesPerField} = kcContext;

    const logoSVG = useRef<HTMLDivElement | null>(null);
    const qrWrapper = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            let input: HTMLInputElement | null = null;
            if (kcContext.pageId === "login.ftl") {
                input = (document.getElementById("shown-username-input") as HTMLInputElement);
            } else if (kcContext.pageId === "login-reset-password.ftl") {
                input = (document.getElementById("reset-pass-username-input") as HTMLInputElement);
            }

            if (input && !input.dataset.itiInitialized) {
                // Initializing the country picker
                const iti = intlTelInput(input, {
                    separateDialCode: false,
                    preferredCountries: ["no"],
                    onlyCountries: ["no", "se", "dk", "fi", "is", "gb", "ie", "ee", "lv", "lt", "nl"],
                    localizedCountries: {},
                });

                // Function to update country prefix
                function updateCountry() {
                    const area = iti.getSelectedCountryData();
                    const newPrefix = area.dialCode;
                    if (input) {
                        input.setAttribute("country-code", newPrefix);
                    }
                }

                input.addEventListener("countrychange", updateCountry);
                input.addEventListener("change", updateCountry);

                updateCountry();

                input.dataset.itiInitialized = "true";
            }
        });

        observer.observe(document.body, {childList: true, subtree: true});

        // Checking if there is an error message to display
        if (kcContext?.message) {
            if (kcContext.message.type && kcContext.message.type === "error" && kcContext.message.summary) {
                displayIziError(kcContext.message.summary);
                if (kcContext.pageId === "login.ftl") {
                    resetLoginButton();
                }
            }
        }

        if (messagesPerField.existsError("username")) {
            displayIziError(messagesPerField.getFirstError("username"));
            if (kcContext.pageId === "login.ftl") {
                resetLoginButton();
            }
        }

        if (messagesPerField.existsError("password")) {
            if (messagesPerField.getFirstError("username") != messagesPerField.getFirstError("password")) {
                displayIziError(messagesPerField.getFirstError("password"));
                if (kcContext.pageId === "login.ftl") {
                    resetLoginButton();
                }
            }
        }

        if (messagesPerField.existsError("password-confirm")) {
            displayIziError(messagesPerField.get("password-confirm"));
            if (kcContext.pageId === "login.ftl") {
                resetLoginButton();
            }
        }

        return () => observer.disconnect(); // cleanup
    }, []);

    useSetClassName({
        qualifiedName: "html",
        className: kcClsx("kcHtmlClass")
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? kcClsx("kcBodyClass")
    });

    const {isReadyToRender} = useInitialize({kcContext, doUseDefaultCss});

    if (!isReadyToRender) {
        return null;
    }

    function toggleQrCode() {
        if (logoSVG.current && qrWrapper.current) {
            logoSVG.current.classList.toggle("hidden");
            qrWrapper.current.classList.toggle("hidden");
        }
    }

    function displayIziError(message: string) {
        let errorMessage = "Noe gikk galt"

        if (message) {
            errorMessage = message
        }
        iziToast.error({
            title: "",
            message: errorMessage,
            position: "bottomCenter",
            timeout: 7000,
        });
    }

    function resetLoginButton() {
        const button = document.getElementById("trigger-submit-btn") as HTMLDivElement | null;

        if (!button) return;

        button.innerHTML = msgStr("login");
        button.classList.remove("disabled");
    }

    return (
        <div className={kcClsx("kcLoginClass")}>
            <div className={"body-wrapper"}>
                <div id="kc-header" className={kcClsx("kcHeaderClass")}>
                    <div id="kc-header-wrapper" className={kcClsx("kcHeaderWrapperClass")}>
                        {/*{msg("loginTitleHtml", realm.displayNameHtml)}*/}
                        <div id={"login-logo-svg"} ref={logoSVG}
                             style={{backgroundImage: `url('${logoSvgUrl}')`}}></div>
                        <div id={"login-qr-svg-wrapper"} ref={qrWrapper} className={"hidden"}>
                            <span className={"close-qr-btn"} onClick={toggleQrCode}></span>
                            <div className={"login-qr-svg"} style={{backgroundImage: `url('${appQR}')`}}></div>
                            <div className={"app-stores-wrapper"}>
                                <a className={"play-store-btn"}
                                   href={"https://play.google.com/store/apps/details?id=cx.gitekx.excite"}
                                   target={"_blank"}>
                                    <img className={"play-store-img"} src={playStoreImg}/>
                                </a>
                                <a className={"app-store-btn"} href={"https://apps.apple.com/app/excite/id1572659287"}
                                   target={"_blank"}>
                                    <img className={"app-store-img"} src={appStoreImg}/>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={kcClsx("kcFormCardClass")}>
                    <header className={kcClsx("kcFormHeaderClass")}>
                        {enabledLanguages.length > 1 && (
                            <div className={kcClsx("kcLocaleMainClass")} id="kc-locale">
                                <div id="kc-locale-wrapper" className={kcClsx("kcLocaleWrapperClass")}>
                                    <div id="kc-locale-dropdown"
                                         className={clsx("menu-button-links", kcClsx("kcLocaleDropDownClass"))}>
                                        <button
                                            tabIndex={1}
                                            id="kc-current-locale-link"
                                            aria-label={msgStr("languages")}
                                            aria-haspopup="true"
                                            aria-expanded="false"
                                            aria-controls="language-switch1"
                                        >
                                            {currentLanguage.label}
                                        </button>
                                        <ul
                                            role="menu"
                                            tabIndex={-1}
                                            aria-labelledby="kc-current-locale-link"
                                            aria-activedescendant=""
                                            id="language-switch1"
                                            className={kcClsx("kcLocaleListClass")}
                                        >
                                            {enabledLanguages.map(({languageTag, label, href}, i) => (
                                                <li key={languageTag} className={kcClsx("kcLocaleListItemClass")}
                                                    role="none">
                                                    <a role="menuitem" id={`language-${i + 1}`}
                                                       className={kcClsx("kcLocaleItemClass")} href={href}>
                                                        {label}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        {(() => {
                            const node = !(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
                                <h1 id="kc-page-title">{headerNode}</h1>
                            ) : (
                                <div id="kc-username" className={kcClsx("kcFormGroupClass")}>
                                    <label id="kc-attempted-username">{auth.attemptedUsername}</label>
                                    <a id="reset-login" href={url.loginRestartFlowUrl}
                                       aria-label={msgStr("restartLoginTooltip")}>
                                        <div className="kc-login-tooltip">
                                            <i className={kcClsx("kcResetFlowIcon")}></i>
                                            <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                                        </div>
                                    </a>
                                </div>
                            );

                            if (displayRequiredFields) {
                                return (
                                    <div className={kcClsx("kcContentWrapperClass")}>
                                        <div className={clsx(kcClsx("kcLabelWrapperClass"), "subtitle")}>
                                        <span className="subtitle">
                                            <span className="required">*</span>
                                            {msg("requiredFields")}
                                        </span>
                                        </div>
                                        <div className="col-md-10">{node}</div>
                                    </div>
                                );
                            }

                            return node;
                        })()}
                    </header>
                    <div id="kc-content">
                        <div id="kc-content-wrapper">
                            {/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
                            {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                                <div
                                    className={clsx(
                                        `alert-${message.type}`,
                                        kcClsx("kcAlertClass"),
                                        `pf-m-${message?.type === "error" ? "danger" : message.type}`
                                    )}
                                >
                                    <div className="pf-c-alert__icon">
                                        {message.type === "success" &&
                                            <span className={kcClsx("kcFeedbackSuccessIcon")}></span>}
                                        {message.type === "warning" &&
                                            <span className={kcClsx("kcFeedbackWarningIcon")}></span>}
                                        {message.type === "error" &&
                                            <span className={kcClsx("kcFeedbackErrorIcon")}></span>}
                                        {message.type === "info" &&
                                            <span className={kcClsx("kcFeedbackInfoIcon")}></span>}
                                    </div>
                                    <span
                                        className={(kcContext.pageId === 'login-idp-link-confirm.ftl' ? "show-error " : "") + kcClsx("kcAlertTitleClass")}
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(message.summary)
                                        }}
                                    />
                                </div>
                            )}
                            {children}
                            {auth !== undefined && auth.showTryAnotherWayLink && (
                                <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
                                    <div className={kcClsx("kcFormGroupClass")}>
                                        <input type="hidden" name="tryAnotherWay" value="on"/>
                                        <a
                                            href="#"
                                            id="try-another-way"
                                            onClick={() => {
                                                document.forms["kc-select-try-another-way-form" as never].submit();
                                                return false;
                                            }}
                                        >
                                            {msg("doTryAnotherWay")}
                                        </a>
                                    </div>
                                </form>
                            )}
                            {socialProvidersNode}
                            {displayInfo && (
                                <div id="kc-info" className={kcClsx("kcSignUpClass")}>
                                    <div id="kc-info-wrapper" className={kcClsx("kcInfoAreaWrapperClass")}>
                                        {infoNode}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className={"excite-footer"}>
                <div
                    className={"excite-app-cta-wrapper " + (kcContext.pageId !== "login-update-password.ftl" ? "" : "invisible")}>
                    <span>Skal du laste ned appen vår?</span>
                    <div className={"toggle-qr-wrapper"} onClick={toggleQrCode}>
                        <i className={"mobile-icon"}></i>
                        <span>Excite på mobilen</span>
                    </div>
                </div>
                <div className={"excite-app-small-screen-btns"}>
                    <a className={"play-store-btn"}
                       href={"https://play.google.com/store/apps/details?id=cx.gitekx.excite"} target={"_blank"}>
                        <img className={"play-store-img"} src={playStoreImg}/>
                    </a>
                    <a href={"https://retailx.no/"} target={"_blank"}>
                        <img className={"excite-logo-small"} src={smallLogoSvgUrl}/>
                    </a>
                    <a className={"app-store-btn"} href={"https://apps.apple.com/app/excite/id1572659287"}
                       target={"_blank"}>
                        <img className={"app-store-img"} src={appStoreImg}/>
                    </a>
                </div>

                <div className={"excite-legal"}>
                    <a href={"https://retailx.no/"} target={"_blank"}>
                        <img className={"excite-logo-small"} src={smallLogoSvgUrl}/>
                    </a>
                    <a href="https://legal.retailx.no/" target={"_blank"} className="excite-legal-link">
                        Juridiske vilkår og retningslinjer
                    </a>
                </div>
            </div>
        </div>
    );
}
