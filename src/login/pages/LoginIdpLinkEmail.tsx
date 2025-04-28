import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginIdpLinkEmail(props: PageProps<Extract<KcContext, { pageId: "login-idp-link-email.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, realm, brokerContext, idpAlias } = kcContext;

    const { msg, msgStr } = i18n;

    console.log(msg("emailLinkIdp1"));

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={msg("emailLinkIdpTitle", idpAlias)}
        >
            <h1 className={"user-shown-form-heading"}>{msgStr("emailLinkIdpTitle", idpAlias)}</h1>

            <div className={"instruction link-email"}>
                <p id="instruction1" className="instruction">
                    {msg("emailLinkIdp1", idpAlias, brokerContext.username, realm.displayName)}
                </p>
                <p id="instruction2" className="instruction">
                    {msg("emailLinkIdp2")}<br/> <a href={url.loginAction}>{msg("doClickHere")}</a> {msg("emailLinkIdp3")}
                </p>
                <p id="instruction3" className="instruction">
                    {msg("emailLinkIdp4")}<br/> <a href={url.loginAction}>{msg("doClickHere")}</a> {msg("emailLinkIdp5")}
                </p>
            </div>
        </Template>
    );
}
