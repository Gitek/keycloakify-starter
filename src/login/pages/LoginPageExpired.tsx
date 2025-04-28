import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginPageExpired(props: PageProps<Extract<KcContext, { pageId: "login-page-expired.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={msg("pageExpiredTitle")}>
            <h1 className={"user-shown-form-heading"}>{msgStr("pageExpiredTitle")}</h1>

            <p id="instruction1" className="instruction page-expired">
                <div className={"instruction-wrapper"}>
                    {msg("pageExpiredMsg1")}
                    <a id="loginRestartLink" href={url.loginRestartFlowUrl}>
                        {msg("doClickHere")}
                    </a>
                </div>
                <div className={"instruction-wrapper"}>
                    {msg("pageExpiredMsg2")}
                    <a id="loginContinueLink" href={url.loginAction}>
                        {msg("doClickHere")}
                    </a>
                </div>
            </p>
        </Template>
    );
}
