(function () {
    "use strict";

    const SUPABASE_URL =
        "https://sozlvjvqrgpaabnvjvxe.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_Pr7CaX_U_a4wcVnhXol_gQ_BTZWDRbx";

    const LOGIN_PAGE = "login.html";

    // Hide page until authentication is checked
    document.documentElement.style.visibility = "hidden";

    function redirectToLogin() {
        window.location.replace(
            LOGIN_PAGE + "?redirect=" +
            encodeURIComponent(
                window.location.pathname.split("/").pop()
            )
        );
    }

    async function checkLogin() {

        try {

            // Supabase library must already be loaded
            if (
                !window.supabase ||
                !window.supabase.createClient
            ) {
                console.error("Supabase library not loaded.");
                redirectToLogin();
                return;
            }

            const client =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_ANON_KEY
                );

            window.schoolSupabase = client;

            const {
                data,
                error
            } = await client.auth.getSession();

            if (error) {
                console.error(
                    "Session error:",
                    error
                );

                redirectToLogin();
                return;
            }

            // No active login session
            if (
                !data ||
                !data.session
            ) {
                redirectToLogin();
                return;
            }

            // Login exists
            window.currentSchoolUser =
                data.session.user;

            // Show page
            document.documentElement.style.visibility =
                "visible";

            // Watch logout
            client.auth.onAuthStateChange(
                function (event, session) {

                    if (
                        event === "SIGNED_OUT" ||
                        !session
                    ) {
                        redirectToLogin();
                    }

                }
            );

        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );

            redirectToLogin();
        }
    }

    checkLogin();

})();
