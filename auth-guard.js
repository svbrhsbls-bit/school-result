/*
=========================================================
 SCHOOL RESULT MANAGEMENT SYSTEM
 SECURE AUTH GUARD
=========================================================

LOGIN FLOW:

login.html
    ↓
dashboard.html
    ↓
students.html
subjects.html
marks-entry.html
reports.html
send-results.html
publish-results.html
settings.html

Login ಒಮ್ಮೆ ಮಾಡಿದರೆ session active ಇರುವವರೆಗೆ
ಮತ್ತೆ login ಕೇಳುವುದಿಲ್ಲ.

Logout ಮಾಡಿದ ನಂತರ protected pages:
    - Direct URL
    - New Tab
    - Browser Back
    - Refresh
ಇವುಗಳ ಮೂಲಕವೂ open ಆಗಬಾರದು.

NOTE:
student-result.html public page ಆಗಿರುವುದರಿಂದ
ಅದಕ್ಕೆ auth-guard.js ಹಾಕಬಾರದು.
=========================================================
*/

(function () {

    "use strict";

    /* =====================================================
       SUPABASE SETTINGS
       ===================================================== */

    const SUPABASE_URL =
        "https://sozlvjvqrgpaabnvjvxe.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_Pr7CaX_U_a4wcVnhXol_gQ_BTZWDRbx";

    const LOGIN_PAGE = "login.html";


    /* =====================================================
       HIDE PAGE UNTIL AUTH CHECK COMPLETES
       ===================================================== */

    document.documentElement.style.visibility = "hidden";


    /* =====================================================
       SUPABASE CLIENT
       ===================================================== */

    let client = null;

    let redirecting = false;


    /* =====================================================
       REDIRECT TO LOGIN
       ===================================================== */

    function goToLogin() {

    if (redirecting) {
        return;
    }

    redirecting = true;

    console.log("AUTH GUARD: Login required.");

    // GitHub Pages 404 page
    window.location.replace(
        "/school-result/page-not-found-404"
    );
}

    /* =====================================================
       LOAD SUPABASE
       ===================================================== */

    function loadSupabase() {

        return new Promise(function (resolve, reject) {

            if (
                window.supabase &&
                typeof window.supabase.createClient === "function"
            ) {

                resolve();

                return;
            }


            const script =
                document.createElement("script");


            script.src =
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";


            script.onload = function () {

                resolve();

            };


            script.onerror = function () {

                reject(
                    new Error(
                        "Supabase library load failed."
                    )
                );

            };


            document.head.appendChild(
                script
            );

        });

    }


    /* =====================================================
       CHECK SESSION
       ===================================================== */

    async function checkSession() {

        try {

            if (!client) {

                await loadSupabase();


                client =
                    window.supabase.createClient(
                        SUPABASE_URL,
                        SUPABASE_ANON_KEY
                    );


                /*
                Other page JavaScript can use this.
                */

                window.schoolSupabase =
                    client;

            }


            const result =
                await client.auth.getSession();


            const session =
                result &&
                result.data &&
                result.data.session;


            /* =============================================
               NO SESSION
               ============================================= */

            if (!session) {

                goToLogin();

                return false;

            }


            /* =============================================
               SESSION EXISTS
               ============================================= */

            window.currentSchoolUser =
                session.user;


            document.documentElement.style.visibility =
                "visible";


            return true;

        }

        catch (error) {

            console.error(
                "AUTH CHECK ERROR:",
                error
            );


            goToLogin();


            return false;

        }

    }


    /* =====================================================
       AUTH STATE CHANGE
       ===================================================== */

    async function setupAuthListener() {

        if (!client) {
            return;
        }


        client.auth.onAuthStateChange(
            function (event, session) {

                console.log(
                    "AUTH EVENT:",
                    event
                );


                /*
                User logged out
                */

                if (
                    event === "SIGNED_OUT" ||
                    !session
                ) {

                    goToLogin();

                    return;

                }


                /*
                Login / session restored
                */

                if (session) {

                    window.currentSchoolUser =
                        session.user;

                    document.documentElement.style.visibility =
                        "visible";

                }

            }
        );

    }


    /* =====================================================
       PROTECT PAGE
       ===================================================== */

    async function protectPage() {

        const loggedIn =
            await checkSession();


        if (!loggedIn) {
            return;
        }


        await setupAuthListener();


        /*
        Browser Back / Forward cache protection
        */

        window.addEventListener(
            "pageshow",
            function () {

                checkSession();

            }
        );


        /*
        When user returns to this tab
        */

        window.addEventListener(
            "focus",
            function () {

                checkSession();

            }
        );


        /*
        When browser tab becomes visible again
        */

        document.addEventListener(
            "visibilitychange",
            function () {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    checkSession();

                }

            }
        );


        /*
        Extra safety check.

        Every 2 seconds session check ಆಗುತ್ತದೆ.
        Logout ಆದ ನಂತರ page maximum 2 seconds ಒಳಗೆ
        login.html ಗೆ ಹೋಗುತ್ತದೆ.
        */

        setInterval(
            function () {

                checkSession();

            },
            2000
        );

    }


    /* =====================================================
       START
       ===================================================== */

    protectPage();


})();
