/*
=========================================================
 SCHOOL RESULT MANAGEMENT SYSTEM
 LOGIN PROTECTION
=========================================================
*/

(function () {

    "use strict";

    const SUPABASE_URL =
        "https://sozlvjvqrgpaabnvjvxe.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_Pr7CaX_U_a4wcVnhXol_gQ_BTZWDRbx";

    const LOGIN_PAGE = "login.html";

    /*
    -----------------------------------------------------
    Prevent page content from flashing before login check
    -----------------------------------------------------
    */

    document.documentElement.style.visibility = "hidden";


    /*
    -----------------------------------------------------
    Load Supabase JS if it is not already loaded
    -----------------------------------------------------
    */

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
                    new Error("Supabase library load failed")
                );
            };

            document.head.appendChild(script);

        });

    }


    /*
    -----------------------------------------------------
    Create Supabase Client
    -----------------------------------------------------
    */

    async function startAuthProtection() {

        try {

            await loadSupabase();

            const supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_ANON_KEY
                );


            /*
            Make client available to other pages
            */

            window.schoolSupabase =
                supabaseClient;


            /*
            -------------------------------------------------
            Check current session
            -------------------------------------------------
            */

            const {
                data,
                error
            } =
            await supabaseClient.auth.getSession();


            if (error) {

                console.error(
                    "Session error:",
                    error
                );

                window.location.replace(
                    LOGIN_PAGE
                );

                return;
            }


            /*
            -------------------------------------------------
            No login session
            -------------------------------------------------
            */

            if (
                !data ||
                !data.session
            ) {

                window.location.replace(
                    LOGIN_PAGE
                );

                return;
            }


            /*
            -------------------------------------------------
            User is logged in
            -------------------------------------------------
            */

            window.currentSchoolUser =
                data.session.user;


            /*
            Show page
            */

            document.documentElement.style.visibility =
                "visible";


            /*
            -------------------------------------------------
            Listen for authentication changes
            -------------------------------------------------
            */

            supabaseClient.auth.onAuthStateChange(
                function (event, session) {

                    if (
                        event === "SIGNED_OUT" ||
                        !session
                    ) {

                        window.location.replace(
                            LOGIN_PAGE
                        );

                    }

                }
            );


        } catch (error) {

            console.error(
                "Authentication protection error:",
                error
            );

            window.location.replace(
                LOGIN_PAGE
            );

        }

    }


    /*
    -----------------------------------------------------
    Start
    -----------------------------------------------------
    */

    startAuthProtection();


})();
