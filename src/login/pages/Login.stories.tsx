import type {Meta, StoryObj} from "@storybook/react";
import {createKcPageStory} from "../KcPageStory";

const {KcPageStory} = createKcPageStory({pageId: "login.ftl"});

const meta = {
    title: "login/login.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <KcPageStory kcContext={{
            locale: {
                currentLanguageTag: "no"
            }
        }}
        />)
};

export const WithInvalidCredential: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                login: {
                    username: "johndoe"
                },
                messagesPerField: {
                    // NOTE: The other functions of messagesPerField are derived from get() and
                    // existsError() so they are the only ones that need to mock.
                    existsError: (fieldName: string, ...otherFieldNames: string[]) => {
                        const fieldNames = [fieldName, ...otherFieldNames];
                        return fieldNames.includes("username") || fieldNames.includes("password");
                    },
                    get: (fieldName: string) => {
                        if (fieldName === "username" || fieldName === "password") {
                            return "Invalid username or password.";
                        }
                        return "";
                    }
                }
            }}
        />
    )
};

export const WithoutRegistration: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                realm: {registrationAllowed: false}
            }}
        />
    )
};

export const WithoutRememberMe: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                realm: {rememberMe: false}
            }}
        />
    )
};

export const WithoutPasswordReset: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                realm: {resetPasswordAllowed: false}
            }}
        />
    )
};

export const WithEmailAsUsername: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                realm: {loginWithEmailAllowed: false}
            }}
        />
    )
};

export const WithPresetUsername: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                login: {username: "max.mustermann@mail.com"}
            }}
        />
    )
};

export const WithImmutablePresetUsername: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                auth: {
                    attemptedUsername: "max.mustermann@mail.com",
                    showUsername: true
                },
                usernameHidden: true,
                message: {
                    type: "info",
                    summary: "Please re-authenticate to continue"
                }
            }}
        />
    )
};

export const WithSocialProviders: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google",
                            iconClasses: "fa fa-google"
                        },
                        {
                            loginUrl: "microsoft",
                            alias: "microsoft",
                            providerId: "microsoft",
                            displayName: "Microsoft",
                            iconClasses: "fa fa-windows"
                        },
                        {
                            loginUrl: "facebook",
                            alias: "facebook",
                            providerId: "facebook",
                            displayName: "Facebook",
                            iconClasses: "fa fa-facebook"
                        },
                        {
                            loginUrl: "instagram",
                            alias: "instagram",
                            providerId: "instagram",
                            displayName: "Instagram",
                            iconClasses: "fa fa-instagram"
                        },
                        {
                            loginUrl: "twitter",
                            alias: "twitter",
                            providerId: "twitter",
                            displayName: "Twitter",
                            iconClasses: "fa fa-twitter"
                        },
                        {
                            loginUrl: "linkedin",
                            alias: "linkedin",
                            providerId: "linkedin",
                            displayName: "LinkedIn",
                            iconClasses: "fa fa-linkedin"
                        },
                        {
                            loginUrl: "stackoverflow",
                            alias: "stackoverflow",
                            providerId: "stackoverflow",
                            displayName: "Stackoverflow",
                            iconClasses: "fa fa-stack-overflow"
                        },
                        {
                            loginUrl: "github",
                            alias: "github",
                            providerId: "github",
                            displayName: "Github",
                            iconClasses: "fa fa-github"
                        },
                        {
                            loginUrl: "gitlab",
                            alias: "gitlab",
                            providerId: "gitlab",
                            displayName: "Gitlab",
                            iconClasses: "fa fa-gitlab"
                        },
                        {
                            loginUrl: "bitbucket",
                            alias: "bitbucket",
                            providerId: "bitbucket",
                            displayName: "Bitbucket",
                            iconClasses: "fa fa-bitbucket"
                        },
                        {
                            loginUrl: "paypal",
                            alias: "paypal",
                            providerId: "paypal",
                            displayName: "PayPal",
                            iconClasses: "fa fa-paypal"
                        },
                        {
                            loginUrl: "openshift",
                            alias: "openshift",
                            providerId: "openshift",
                            displayName: "OpenShift",
                            iconClasses: "fa fa-cloud"
                        }
                    ]
                }
            }}
        />
    )
};

export const WithoutPasswordField: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                realm: {password: false}
            }}
        />
    )
};

export const WithErrorMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                message: {
                    summary: "The time allotted for the connection has elapsed.<br/>The login process will restart from the beginning.",
                    type: "error"
                }
            }}
        />
    )
};

export const WithOneSocialProvider: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google",
                            iconClasses: "fa fa-google"
                        }
                    ]
                }
            }}
        />
    )
};

export const WithTwoSocialProviders: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google",
                            iconClasses: "fa fa-google"
                        },
                        {
                            loginUrl: "microsoft",
                            alias: "microsoft",
                            providerId: "microsoft",
                            displayName: "Microsoft",
                            iconClasses: "fa fa-windows"
                        }
                    ]
                }
            }}
        />
    )
};
export const WithNoSocialProviders: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                social: {
                    displayInfo: true,
                    providers: []
                }
            }}
        />
    )
};
export const WithMoreThanTwoSocialProviders: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google",
                            iconClasses: "fa fa-google"
                        },
                        {
                            loginUrl: "microsoft",
                            alias: "microsoft",
                            providerId: "microsoft",
                            displayName: "Microsoft",
                            iconClasses: "fa fa-windows"
                        },
                        {
                            loginUrl: "facebook",
                            alias: "facebook",
                            providerId: "facebook",
                            displayName: "Facebook",
                            iconClasses: "fa fa-facebook"
                        },
                        {
                            loginUrl: "twitter",
                            alias: "twitter",
                            providerId: "twitter",
                            displayName: "Twitter",
                            iconClasses: "fa fa-twitter"
                        }
                    ]
                }
            }}
        />
    )
};
export const WithSocialProvidersAndWithoutRememberMe: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                locale: {
                    currentLanguageTag: "no"
                },
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google",
                            iconClasses: "fa fa-google"
                        }
                    ]
                },
                realm: {rememberMe: false}
            }}
        />
    )
};

// ---------------------------------------------------------------------------
// Passordløs innlogging (magic link) — PHASE 0 VISUAL MOCK
// Every reviewable state. No backend.
// Follows plan §3.5: text link at the bottom, full address, 10 min, 45 s resend,
// plus the recovery screen.
// ---------------------------------------------------------------------------
const no = { currentLanguageTag: "no" } as const;

const socials = {
    displayInfo: true,
    providers: [
        { loginUrl: "microsoft", alias: "microsoft", providerId: "microsoft", displayName: "Microsoft", iconClasses: "fa fa-windows" },
        { loginUrl: "oidc", alias: "oidc", providerId: "oidc", displayName: "Logg inn med SSO", iconClasses: "" }
    ]
};

/** The login page as it now ships: one primary button, "Glemt passord?" beside the
 *  password field, and the passwordless entry as a text link at the bottom. */
export const Pwless_Entry: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials, lastUsedIdp: "microsoft" } as any} />
};

/** Same, with no IdP marked — confirms the "· sist brukt" marker is not load-bearing. */
export const Pwless_Entry_NoLastUsed: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials } as any} />
};

/** STEP 1 — the dedicated page, identifier carried over from the login field. */
export const Pwless_Page_Ask: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials,
        pwlessView: "request", pwlessIdentifier: "khai@retailx.no" } as any} />
};

/** STEP 1 — arrived with nothing typed, so the field is empty. */
export const Pwless_Page_Ask_Empty: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials, pwlessView: "request" } as any} />
};

/** STEP 2 — confirmation, EMAIL. Address in full, resend locked for 45 s. */
export const Pwless_Page_Sent_Email: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials,
        pwlessView: "sent", pwlessMock: "waiting", pwlessIdentifier: "khai@retailx.no" } as any} />
};

/** STEP 2 — confirmation, SMS. Only reached when the user has no email AND the
 *  enterprise has SMS greenlit (§3.4). */
export const Pwless_Page_Sent_Sms: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials,
        pwlessView: "sent", pwlessMock: "waiting", pwlessIdentifier: "+4794053096" } as any} />
};

/** STEP 2 — confirmation, PUSH. The first channel tried for a returning app user. */
export const Pwless_Page_Sent_Push: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials, pwlessView: "sent",
        pwlessMock: "waiting", pwlessChannel: "push", pwlessIdentifier: "khai@retailx.no" } as any} />
};

/** STEP 3, before the first poll answers — the channel is not known yet. */
export const Pwless_Page_Sending: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials, pwlessView: "sent",
        pwlessMock: "waiting", pwlessChannelKnown: false, pwlessIdentifier: "khai@retailx.no" } as any} />
};

/** STEP 3, RESENT — says out loud that the previous link is now dead. */
export const Pwless_Page_Resent: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials, pwlessView: "sent",
        pwlessMock: "waiting", pwlessResent: true, pwlessIdentifier: "khai@retailx.no" } as any} />
};

/** RECOVERY — an expired or already-used link. Address pre-filled AND editable. */
export const Pwless_Page_Recovery: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials,
        pwlessView: "recovery", pwlessMock: "expired", pwlessIdentifier: "khai@retailx.no" } as any} />
};

export const Pwless_Page_Empty_Error: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials,
        pwlessView: "request", pwlessMock: "missing" } as any} />
};

export const Pwless_Page_Invalid_Error: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials,
        pwlessView: "request", pwlessMock: "invalid", pwlessIdentifier: "hallo hallo" } as any} />
};

export const Pwless_Page_RateLimited: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, social: socials,
        pwlessView: "sent", pwlessMock: "ratelimited", pwlessIdentifier: "+4794053096" } as any} />
};

/**
 * NOT a login story — a guard. `login-username.ftl` is the page Organizations served when it
 * was enabled, and this theme has no case for it, so it falls through to DefaultPage. It must
 * render Keycloak's own form rather than nothing. If this comes back blank, the fail-blank fix
 * in main.css has regressed and Phase 5's five new pages are unsafe to add.
 */
export const Unhandled_PageId_MustNotBeBlank: Story = {
    render: () => <KcPageStory kcContext={{ locale: no, pageId: "login-username.ftl" } as any} />
};
