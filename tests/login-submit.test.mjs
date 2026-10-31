import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Exercise the component's actual submit handler with the refs Keycloak mounts.
// No credentials, HTTP requests or external authentication are involved.
const source = readFileSync(new URL('../src/login/pages/Login.tsx', import.meta.url), 'utf8');
const start = source.indexOf('    function triggerLoginSubmit()');
const end = source.indexOf('    //If going to use keycloak forgot password', start);
assert.ok(start >= 0 && end > start, 'the real login submit handler must be found');
const javascript = ts.transpileModule(source.slice(start, end), {
    compilerOptions: { target: ts.ScriptTarget.ES2022 }
}).outputText;

function fixture({ hidden = false, username = 'fixture@example.invalid', password = 'synthetic-password', prefix = null } = {}) {
    const state = { submissions: [], focused: null, spinner: false };
    const input = (name, value) => ({ current: { value, focus: () => { state.focused = name; }, getAttribute: () => prefix } });
    const kcUsernameInput = hidden ? { current: null } : input('real-username', username);
    const usernameInput = hidden ? { current: null } : input('username', username);
    const kcPasswordInput = input('real-password', password);
    const passwordInput = input('password', password);
    const loginForm = { current: { submit: () => state.submissions.push({
        username: kcUsernameInput.current?.value,
        password: kcPasswordInput.current.value
    }) } };
    const document = { getElementById: () => ({ innerHTML: '', classList: { add: () => { state.spinner = true; } } }) };
    const handler = new Function('usernameHidden', 'loginForm', 'kcPasswordInput', 'kcUsernameInput',
        'passwordInput', 'usernameInput', 'document', 'isNumeric', `${javascript}; return triggerLoginSubmit;`)(
        hidden, loginForm, kcPasswordInput, kcUsernameInput, passwordInput, usernameInput, document,
        value => value !== '' && Number.isFinite(Number(value)));
    return { state, handler, passwordInput, kcPasswordInput };
}

test('reauthentication submits without either username control and keeps the server-owned identity', () => {
    const f = fixture({ hidden: true });
    f.handler();
    assert.deepEqual(f.state.submissions, [{ username: undefined, password: 'synthetic-password' }]);
    assert.equal(f.state.spinner, true);
});

test('reauthentication with an empty password focuses it without disabling the button', () => {
    const f = fixture({ hidden: true, password: '' });
    f.handler();
    assert.deepEqual(f.state.submissions, []);
    assert.equal(f.state.focused, 'password');
    assert.equal(f.state.spinner, false);
});

test('reauthentication copies the visible password at submit time', () => {
    const f = fixture({ hidden: true });
    f.kcPasswordInput.current.value = '';
    f.handler();
    assert.equal(f.state.submissions.length, 1);
    assert.equal(f.state.submissions[0].password, f.passwordInput.current.value);
});

test('ordinary email login still submits both fields', () => {
    const f = fixture();
    f.handler();
    assert.equal(f.state.submissions.length, 1);
    assert.equal(f.state.submissions[0].username, 'fixture@example.invalid');
});

test('ordinary phone login keeps the selected country prefix', () => {
    const f = fixture({ username: '12345678', prefix: '+47' });
    f.handler();
    assert.equal(f.state.submissions[0].username, '+4712345678');
});

test('ordinary login still focuses a missing username or password', () => {
    for (const [options, focus] of [[{ username: '' }, 'username'], [{ password: '' }, 'password']]) {
        const f = fixture(options);
        f.handler();
        assert.equal(f.state.submissions.length, 0);
        assert.equal(f.state.focused, focus);
        assert.equal(f.state.spinner, false);
    }
});
