// JSLint, include this before tests
// var window, cordova, $, document, jQuery, navigator, device, onDeviceReady, onResume, onPause, pressBackButton, setTimeout, togglePanel, checkConnection, Connection, hideNonContextButtons, panelMenuLeftOpened, showNonContextButtons, initServiceSettings, panelMenuLeftClosed, androidServiceHandler, startPreLoadImages, onMenuKeyDown, onSearchKeyDown, checkOpenPanels;

// globale Variable die am Anfang auf 0 gesetzt wird, damit beim ersten Start der LoginProzess ausgefuehrt werden kann
var loadingFirst = '0';
var pushNotification;
var pushRegID = 'leer';



// global settings
window.androidPrefsLib = "jpHoloSharedPreferences";
window.loadingAnimation = '<div class="loading"><div class="outer"></div><div class="inner"></div></div>';
$.i18n.init({ getAsync: false, debug: true, fallbackLng: 'en' });

/* PhoneGap plugin functions */

// needed to do an empty callback when setting a value
function emptyCallback() {
}

// AndroidPreferences
function handleAndroidPreferences(action, prefLib, prefName, prefValue, callback) {
        if (window.phonegapExcluded === false) {
                var androidPref = cordova.require("cordova/plugin/androidpreferences"),
                        value;
                if (prefLib !== "" && prefName !== "") {
                        if (action === "get") {
                                androidPref.get(
                                        {preferenceLib: prefLib, preferenceName: prefName, preferenceValue: prefValue},
                                        function (returnValue) {
                                                console.info("PhoneGap Plugin: AndroidPreferences: callback success");
                                                value = returnValue;
                                                callback(value);
                                        },
                                        function () {
                                                console.error("PhoneGap Plugin: AndroidPreferences: callback error");
                                                value = "";
                                                callback(value);
                                        }
                                );
                        } else if (action === "set") {
                                androidPref.set(
                                        {preferenceLib: prefLib, preferenceName: prefName, preferenceValue: prefValue},
                                        function () {
                                                console.info("PhoneGap Plugin: AndroidPreferences: callback success");
                                                value = "";
                                                callback(value);
                                        },
                                        function () {
                                                console.error("PhoneGap Plugin: AndroidPreferences: callback error");
                                                value = "";
                                                callback(value);
                                        }
                                );
                        }
                }
        } else {
                if (prefLib !== "" && prefName !== "") {
                        if (action === "get") {
                                prefValue = window.localStorage.getItem(prefLib + prefName);
                                callback(prefValue);
                        } else if (action === "set") {
                                window.localStorage.setItem(prefLib + prefName, prefValue);
                                callback(prefValue);
                        }
                }
        }
}

// Appstore
function appstore(link, type) {
        if (window.phonegapExcluded === false) {
                var appstores = cordova.require("cordova/plugin/appstore");
                appstores.show(
                        {link: link, type: type},
                        function () {
                                console.info("PhoneGap Plugin: Appstore: show: callback success");
                        },
                        function () {
                                console.error("PhoneGap Plugin: Appstore: show: callback error");
                        }
                );
        } else {
                if (type === 'app') {
                        window.open('https://play.google.com/store/apps/details?id=' + link, '_blank');
                } else if (type === 'pub') {
                        window.open('https://play.google.com/store/apps/developer?id=' + link, '_blank');
                }
        }
}

// Appstore check
function appstoreCheck(callback) {
        if (window.phonegapExcluded === false) {
                var appstores = cordova.require("cordova/plugin/appstore");
                appstores.check(
                        function (appstore) {
                                console.info("PhoneGap Plugin: Appstore: check: callback success");
                                callback(appstore);
                        },
                        function () {
                                console.error("PhoneGap Plugin: Appstore: check: callback error");
                                callback("unknown");
                        }
                );
        } else {
                callback("unknown");
        }
}

// PackageVersion
function getPackageVersion(callback) {
        var currentVersion;
        if (window.phonegapExcluded === false) {
                var packageVersion = cordova.require("cordova/plugin/packageversion");
                packageVersion.get(
                        function (version) {
                                console.info("PhoneGap Plugin: PackageVersion: callback success");
                                currentVersion = version;
                                callback(currentVersion);
                        },
                        function () {
                                console.error("PhoneGap Plugin: PackageVersion: callback error");
                                currentVersion = "unknown";
                                callback(currentVersion);
                        }
                );
        } else {
                currentVersion = "web";
                callback(currentVersion);
        }
}

// PreferredScreenSize
function handlePreferredScreenSize(callback) {
        if (window.phonegapExcluded === false) {
                var preferredScreenSize = cordova.require("cordova/plugin/preferredscreensize");
                preferredScreenSize.getSystem(
                        function (currentScreenSize) {
                                console.info("PhoneGap Plugin: PreferredScreenSize: callback success");
                                callback(currentScreenSize);
                        },
                        function () {
                                console.error("PhoneGap Plugin: PreferredScreenSize: callback error");
                                callback("unknown");
                        }
                );
        } else {
                callback("web");
        }
}

// HomeButton
function homeButton() {
        if (window.phonegapExcluded === false) {
                var home = cordova.require("cordova/plugin/homebutton");
                home.show(
                        function () {
                                console.info("PhoneGap Plugin: HomeButton: callback success");
                        },
                        function () {
                                console.error("PhoneGap Plugin: HomeButton: callback error");
                        }
                );
        } else {
                window.open(window.indexFile);
        }
}

// Share   DIESE FUNKTION IST VERALTET, durch ein neues PLUGIN WIRD DIESE NICHT MEHR GENUTZT...siehe SHARE PRESS ON CLICK
function share(subject, text) {
        if (window.phonegapExcluded === false) {
                var shares = cordova.require("cordova/plugin/share");
                shares.show(
                        {subject: subject, text: text},
                        function () {
                                console.info("PhoneGap Plugin: Share: callback success");
                        },
                        function () {
                                console.error("PhoneGap Plugin: Share: callback error");
                        }
                );
        } else {
                subject = subject.replace('', '%20');
                text = text.replace('', '%20');
                window.location.href = "mailto:info@aktienfreunde.net?subject=" + subject + "&body=" + text;
        }
}

// Toasts
function toast(text, duration) {
        if (window.phonegapExcluded === false) {
                var toasts = cordova.require("cordova/plugin/toasts");
                if (duration === "short") {
                        toasts.showShort(
                                text,
                                function () {
                                        console.info("PhoneGap Plugin: Toasts short: callback success");
                                },
                                function () {
                                        console.error("PhoneGap Plugin: Toasts short: callback error");
                                }
                        );
                } else if (duration === "long") {
                        toasts.showLong(
                                text,
                                function () {
                                        console.info("PhoneGap Plugin: Toasts long: callback success");
                                },
                                function () {
                                        console.error("PhoneGap Plugin: Toasts long: callback error");
                                }
                        );
                } else {
                        toasts.cancel(
                                function () {
                                        console.info("PhoneGap Plugin: Toasts cancel: callback success");
                                },
                                function () {
                                        console.error("PhoneGap Plugin: Toasts cancel: callback error");
                                }
                        );
                }
        } else {
                alert(text);
        }
}
/* END PhoneGap plugins */

// device ready
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
        // let the function "isDeviceReady" know that the event "deviceready" has been fired
        window.deviceReady = true;
        // prelude app images for faster GUI
        startPreLoadImages();
        //Get PushIDs from MessageServer
        try{
        pushNotification = window.plugins.pushNotification;
        //$("#app-status-ul").append('<li>registering ' + device.platform + '</li>');
        if (device.platform == 'android' || device.platform == 'Android' ||
           device.platform == 'amazon-fireos' ) {
           pushNotification.register(successHandler, errorHandler, {"senderID":"325583734632","ecb":"onNotification"});                // required!
           } else {
                  pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});        // required!
                  }
                  }
        catch(err){
                 txt="There was an error on this page.\n\n";
                 txt+="Error description: " + err.message + "\n\n";
                 alert(txt);
        }
        // execute when app resumes from pause
        document.addEventListener("resume", onResume, false);
        // execute when app goes to pause (home button or opening other app)
        document.addEventListener("pause", onPause, false);
        // override default backbutton behavior with own
        document.addEventListener("backbutton", pressBackButton, false);
        // override default menubutton behavior with own
        document.addEventListener("menubutton", onMenuKeyDown, false);
        // override default searchbutton behavior with own
        document.addEventListener("searchbutton", onSearchKeyDown, false);
        // check if Android Service is running and needs to be running and act accordingly
        androidServiceHandler("getStatus", "none");
        // demonstrate panel menu on first boot
//        if (window.localStorage.getItem('firstBoot') !== 'done') {
//                var headerTitle = $("#headerTitle" + window.localStorage.getItem("divIdGlobal"));
//                headerTitle.addClass("holoPressEffect");
//                setTimeout(function () {
//                        togglePanel('#panelMenuIndex');
//                }, 500);
//                setTimeout(function () {
//                        headerTitle.removeClass("holoPressEffect");
//                        togglePanel('#panelMenuIndex');
//                }, 1500);
//                window.localStorage.setItem('firstBoot', 'done');
//        }
}



// event handler orientationchange
$(window).bind('orientationchange',
        function (event) {
                if (event.orientation === 'portrait') {
                        //do something
                } else if (event.orientation === 'landscape') {
                        //do something
                }
        });

// image preloader
jQuery.preloadImages = function () {
        var i;
        for (i = 0; i < arguments.length; i = i + 1) {
                jQuery("<img>").attr("src", arguments[i]);
        }
};

// actually preload images
function startPreLoadImages() {
        $.preloadImages(
                "./images/icons/ic_action_home.png",
                "./images/icons/ic_action_info.png",
                "./images/icons/ic_action_list_header.png",
                "./images/icons/ic_action_overflow_header.png",
                "./images/icons/refresh.gif",
                "./images/icons/loading.gif",
                "./images/icons/ic_action_search_header.png",
                "./images/icons/ic_launcher_full_arrow.png",
                "./images/icons/ic_launcher_full_menu.png",
                "./images/icons/ic_launcher_full_menu_opened.png",
                "./images/icons/ic_launcher_full_noarrow.png"
        );
}


// ALLES FUNKTIONEN FUER PUSH SERVICE HIER
            // handle APNS notifications for iOS
            function onNotificationAPN(e) {
                if (e.alert) {
                     //$("#app-status-ul").append('<li>push-notification: ' + e.alert + '</li>');
                     // showing an alert also requires the org.apache.cordova.dialogs plugin
                     navigator.notification.alert(e.alert);
                }

                if (e.sound) {
                    // playing a sound also requires the org.apache.cordova.media plugin
                    var snd = new Media(e.sound);
                    snd.play();
                }

                if (e.badge) {
                    pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
                }
            }

// handle GCM notifications for Android
            function onNotification(e) {
                //$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

                switch( e.event )
                {
                    case 'registered':
                                        if ( e.regid.length > 0 )
                                        {
                                                //$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
                                                // Your GCM push server needs to know the regID before it can push to this device
                                                // here is where you might want to send it the regID for later use.
                                                console.log("regID = " + e.regid);
                                                pushRegID = e.regid;
                                                ClosingBellFirstLoad(); //Laedt erst mal den BellButton //Funktion zum senden der ID an den PushServer ist ganz unten hier
                                        }
                    break;

                    case 'message':
                            // if this flag is set, this notification happened while we were in the foreground.
                            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
                            if (e.foreground)
                            {
                                                        //$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
                                                        // on Android soundname is outside the payload.
                                                        // On Amazon FireOS all custom attributes are contained within payload
                                                        var soundfile = e.soundname || e.payload.sound;
                                                        // if the notification contains a soundname, play it.
                                                        // playing a sound also requires the org.apache.cordova.media plugin
                                                        var my_media = new Media("/android_asset/www/"+ soundfile);

                                                        my_media.play();
                                                        alert('Closing Bell: ' + e.payload.message);
                                                }
                                                else
                                                {        // otherwise we were launched because the user touched a notification in the notification tray.
                                                       alert('Closing Bell: ' + e.payload.message);
                                                }

                                                //$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
                        //android only
                                                //$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
                        //amazon-fireos only
                        //$("#app-status-ul").append('<li>MESSAGE -> TIMESTAMP: ' + e.payload.timeStamp + '</li>');
                    break;

                    case 'error':
                                                //$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
                    break;

                    default:
                                                //$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
                    break;
                }
            }

            function tokenHandler (result) {
                //$("#app-status-ul").append('<li>token: '+ result +'</li>');
                // Your iOS push server needs to know the token before it can push to this device
                // here is where you might want to send it the token for later use.
            }

            function successHandler (result) {
                //$("#app-status-ul").append('<li>success:'+ result +'</li>');
            }

            function errorHandler (error) {
                //$("#app-status-ul").append('<li>error:'+ error +'</li>');
            }

// callback function to check if device is ready
function isDeviceReady(value, action) {
        if (window.deviceReady === true) {
                var connection = checkConnection();
                switch (action) {
                case "toastReady":
                      //  toast("Holo Light with Dark action bar example\nDevice is ready according to PhoneGap.\nConnection type: " + connection + "\n\nThis is your value: " + value, "short");
                        break;
                case "action2":
                        // code
                        break;
                case "action3":
                        // code
                        break;
                }
        } else {
                window.setTimeout("isDeviceReady(\"" + value + "\", \"" + action + "\");", 100);
        }
}

// clean URI preferences variables
function cleanUriVars() {
        handleAndroidPreferences("set", window.androidPrefsLib, "UriMessage", "", emptyCallback);
}

// override default back button handling
function pressBackButton() {
        // if panel is not open, then go on
        if (checkOpenPanels() === false) {
                if ($.mobile.pageContainer.pagecontainer("getActivePage")[0].id === "indexPage") {
                        navigator.app.exitApp(); // This will exit the app.
                        // homeButton(); // This will push the app to the background.
                } else {
                        window.history.back();
                }
        // else close panels first, and stop further action
        } else {
                var divLeftId, divRightId;
                if (window.localStorage.getItem('panelLeft') === 'open') {
                        divLeftId = '#panelMenu' + window.localStorage.getItem("divIdGlobal");
                        $(divLeftId).panel("close");
                } else if (window.localStorage.getItem('panelRight') === 'open') {
                        divRightId = '#panelMenuRight' + window.localStorage.getItem("divIdGlobal");
                        $(divRightId).panel("close");
                }
        }
}

// menu button
function onMenuKeyDown() {
    togglePanel('#panelMenuRight' + window.localStorage.getItem("divIdGlobal"));
}

// search button
function onSearchKeyDown() {
   GoToSearch();
}

// pause app
function onPause() {
       // toast('App paused', 'short');
}

// resume app
function onResume() {
      //  toast('App resumed', 'short');
}

// get current date as string
function currentDate() {
        var today = new Date(), dd = today.getDate(), mm = today.getMonth() + 1, yyyy = today.getFullYear(), date = yyyy + "-" + mm + "-" + dd;
        return date;
}

// get current connection type
function checkConnection() {
        var networkState = navigator.connection.type, states = {};
        states[Connection.UNKNOWN] = 'Unknown';
        states[Connection.ETHERNET] = 'Ethernet';
        states[Connection.WIFI] = 'WiFi';
        states[Connection.CELL_2G] = '2G';
        states[Connection.CELL_3G] = '3G';
        states[Connection.CELL_4G] = '4G';
        states[Connection.NONE] = 'None';
        return states[networkState];
}

// clear to first boot state
function clearFirstBoot() {
        window.localStorage.clear();
        navigator.app.exitApp();
}

// default left panelmenu (define menu for all pages)
function panelMenu(divId) {
        var panel = $('#panelMenu' + divId + 'UL');
        panel.children().remove('li');
        panel.append('<li data-icon="false" class="headerSpace"><p>&nbsp;</p></li>'); // empty space, needed for header
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame0(); return false;"><img src="./images/icons/ic_action_home.png" class="ui-li-icon largerIcon">Investmentcockpit</a></li>');
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame1(); return false;"><img src="./images/icons/ic_action_home.png" class="ui-li-icon largerIcon">Finanzblog</a></li>');
        panel.append('<li data-role="list-divider"><p class="panelTextDivider">Finanz&uuml;bersicht</p></li>');
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame3(); return false;"><img src="./images/icons/ic_action_info.png" class="ui-li-icon largerIcon">Statistiken</a></li>');
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame4(); return false;"><img src="./images/icons/ic_action_info.png" class="ui-li-icon largerIcon">Watchlisten</a></li>');
        panel.append('<li data-role="list-divider"><p class="panelTextDivider">Soziales</p></li>');
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame5(); return false;"><img src="./images/icons/ic_action_info.png" class="ui-li-icon largerIcon">Mein Profil</a></li>');
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame6(); return false;"><img src="./images/icons/ic_action_info.png" class="ui-li-icon largerIcon">Freunde</a></li>');
        panel.listview('refresh');
}

// default right panelmenu (define menu for all pages)
function panelMenuRight(divId) {
        var panel = $('#panelMenuRight' + divId + 'UL');
        panel.children().remove('li');
        panel.append('<li data-icon="false" class="headerSpace"><p>&nbsp;</p></li>'); // empty space, needed for header
        panel.append('<li data-role="list-divider"><p class="panelTextDivider">Verwaltung</p></li>');
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame7(); return false;"><img src="./images/icons/ic_action_info.png" class="ui-li-icon largerIcon">Gegenkonto</a></li>');
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame10(); return false;"><img src="./images/icons/ic_action_info.png" class="ui-li-icon largerIcon">Depots verwalten</a></li>');
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame8(); return false;"><img src="./images/icons/ic_action_info.png" class="ui-li-icon largerIcon">Finanzrechner</a></li>');
        panel.append('<li data-role="list-divider"><p class="panelTextDivider">Zur App</p></li>');
        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame9(); return false;"><img src="./images/icons/ic_action_info.png" class="ui-li-icon largerIcon">Impressum &frasl; Datenschutz</a></li>');

        panel.append('<li data-icon="false"><a class="panelText" href="" onClick="changeFrame11(); return false;"><img src="./images/icons/ic_action_home.png" class="ui-li-icon largerIcon">Login &frasl; Logout</a></li>');
        panel.listview('refresh');
}

function SetLoader() {
         document.getElementById('loader1').style.display = "inline";   //zeigt Lade GIF ueber dem Iframe
         document.getElementById("headerShareIndex").src="./images/icons/loading.gif";
         document.getElementById("headerShareImpressum").src="./images/icons/loading.gif";
         document.getElementById("headerShareDatenschutz").src="./images/icons/loading.gif";
         document.getElementById("headerShareService").src="./images/icons/loading.gif";
         }
function changeFrame0(){
         SetLoader();       //setzte Ladebild um Iframe zu verstecken bis fertiggeladen
         window.location.href = "#indexPage";        //springt zum Index
         document.getElementsByName("mainframe")[0].src="http://aktienfreunde.net/investment/list/?afForceMobile=true&afDisableMobileControls=true";  //laedt neue seite in iframe
         }
function changeFrame1(){
         SetLoader();                                 //setzte Ladebild um Iframe zu verstecken bis fertiggeladen
         window.location.href = "#indexPage";       // springe zur Investmentseite wo IFrame eingebettet ist
         document.getElementsByName("mainframe")[0].src="http://blog.aktienfreunde.net/artikel/?theme=Generic+jQuery+Mobile+Theme+1.2.0&passkey=93948456754418bf9a2e55";  //laedt neue seite in iframe
         }
function changeFrame3(){
         SetLoader();
         window.location.href = "#indexPage";
         document.getElementsByName("mainframe")[0].src="http://aktienfreunde.net/statistic/index/?afForceMobile=true&afDisableMobileControls=true";
         }
function changeFrame4(){
         SetLoader();
         window.location.href = "#indexPage";
         document.getElementsByName("mainframe")[0].src="http://aktienfreunde.net/watchlist/show/?afForceMobile=true&afDisableMobileControls=true";
         }
function changeFrame5(){
         SetLoader();
         window.location.href = "#indexPage";
         document.getElementsByName("mainframe")[0].src="http://aktienfreunde.net/profile/show/?afForceMobile=true&afDisableMobileControls=true";
         }
function changeFrame6(){
         SetLoader();
         window.location.href = "#indexPage";
         document.getElementsByName("mainframe")[0].src="http://aktienfreunde.net/friend/showFriends/?afForceMobile=true&afDisableMobileControls=true";
         }
function changeFrame7(){
         SetLoader();
         window.location.href = "#indexPage";
         document.getElementsByName("mainframe")[0].src="http://aktienfreunde.net/investment/showCashType/?afForceMobile=true&afDisableMobileControls=true";
         }
function changeFrame8(){
         SetLoader();
         window.location.href = "#indexPage";
         document.getElementsByName("mainframe")[0].src="http://aktienfreunde.net/interest/index/?afForceMobile=true&afDisableMobileControls=true";
         }
function changeFrame9(){
         //kein SetLoader weil keine Webpage
         window.location.href = "#impressumPage";
         }
function changeFrame10(){
         SetLoader();
         window.location.href = "#indexPage";
         document.getElementsByName("mainframe")[0].src="http://aktienfreunde.net/account/index/?afForceMobile=true&afDisableMobileControls=true";
         }
function changeFrame11(){
         //kein SeitLoader weil keine Webpage
         window.location.href = "#servicePage";
         }


// panel open and closed handling
function panelHandling() {
        var currentId = window.localStorage.getItem("divIdGlobal");
        $("#panelMenu" + currentId).panel({
                open: function () {
                        window.localStorage.setItem("panelLeft", 'open');
                        hideNonContextButtons('panel');
                        panelMenuLeftOpened();
                }
        });
        $("#panelMenu" + currentId).panel({
                close: function () {
                        window.localStorage.setItem("panelLeft", 'closed');
                        showNonContextButtons('panel');
                        panelMenuLeftClosed();
                }
        });
        $("#panelMenu" + currentId + "UL").on("click", "li", function () {
                $('#panelMenu' + currentId).panel("close");
        });
        $("#panelMenuRight" + currentId).panel({
                open: function () {
                        window.localStorage.setItem("panelRight", 'open');
                        hideNonContextButtons('panel');
                }
        });
        $("#panelMenuRight" + currentId).panel({
                close: function () {
                        window.localStorage.setItem("panelRight", 'closed');
                        showNonContextButtons('panel');
                }
        });
        $("#panelMenuRight" + currentId + "UL").on("click", "li", function () {
                $('#panelMenuRight' + currentId).panel("close");
        });
}

// reset panel states
function resetPanelState() {
        window.localStorage.setItem('panelLeft', 'closed');
        window.localStorage.setItem('panelRight', 'closed');
}

// check if there is a panel open or not
function checkOpenPanels() {
        if (window.localStorage.getItem('panelLeft') === "closed" && window.localStorage.getItem('panelRight') === "closed") {
                return false;
        }
        return true;
}

// hide non-contextual buttons when panel opens
function hideNonContextButtons(type) {
 //       var currentId = window.localStorage.getItem("divIdGlobal");
 //       if ($('#headerShare' + currentId).length > 0) {
 //               $('#headerShare' + currentId).hide();
 //               $('#headerSearch' + currentId).hide();
 //       }
 //       // use this part if you want to hide buttons in action bars of which the buttons do not apply to every page
 //       if ($('#headerOtherButton' + currentId).length > 0 && type !== "somethingOtherThenPanel") {
 //               $('#headerOtherButton' + currentId).hide();
 //       }
}

// show non-contextual buttons when panel closes
function showNonContextButtons(type) {
        var currentId = window.localStorage.getItem("divIdGlobal");
        if ($('#headerShare' + currentId).length > 0) {
                $('#headerShare' + currentId).show();
                $('#headerSearch' + currentId).show();
        }
        // use this part if you want to show buttons in action bars of which the buttons do not apply to every page
        if ($('#headerOtherButton' + currentId).length > 0 && type !== "somethingOtherThenPanel") {
                $('#headerOtherButton' + currentId).show();
        }
}

// show title icon with the dashes more to the left
function panelMenuLeftOpened() {
        if (window.localStorage.getItem("pageNaveType") === "menu") {
                $("#headerTitle" + window.localStorage.getItem("divIdGlobal")).attr("src", "./images/icons/ic_launcher_full_menu_opened.png");
        }
}

// show title icon with the dashes more to the right
function panelMenuLeftClosed() {
        if (window.localStorage.getItem("pageNaveType") === "menu") {
                $("#headerTitle" + window.localStorage.getItem("divIdGlobal")).attr("src", "./images/icons/ic_launcher_full_menu.png");
        }
}

// toggle panel menu (open/close)
function togglePanel(panel) {
        $(panel).panel("toggle");
}

// get the systemspecs
function getSystemSpecs() {
        var $content = $('#systemSpecs'),
                tag;
        if (window.phonegapExcluded === false) {
                tag =        '<p id="systemSpecs">' +
                                'Device model: ' + device.model + '<br />' +
                                'Device platform: ' + device.platform + ' ' + device.version + '<br />' +
                                'PhoneGap version: ' + cordova.version + '<br />' +
                                'jQuery version: ' + jQuery.fn.jquery + '<br />' +
                                'jQuery Mobile version: ' + $.mobile.version + '<br />' +
                                '</p>';
        } else {
                tag =        '<p id="systemSpecs">' +
                                'Operating System: ' + navigator.platform + '<br />' +
                                'Browser: ' + navigator.appName + ' ' + navigator.appVersion + '<br />' +
                                'jQuery version: ' + jQuery.fn.jquery + '<br />' +
                                'jQuery Mobile version: ' + $.mobile.version + '<br />' +
                                '</p>';
        }
        $content.replaceWith(tag);
}

// press effect in header bar
function pressEffectHeader(share, action) {
        /** use action "menu" when using app icon as side panel (#panelMenu...)
        *        use action "back" when using app icon as back
        */
        window.localStorage.setItem("pageNaveType", action);
        var currentId = window.localStorage.getItem("divIdGlobal");
        // restore icons
        if (action === "menu") {
                $("#headerTitle" + currentId).attr("src", "./images/icons/ic_launcher_full_menu.png");
               // detect swiperight to open left panel upon swiperight
//                 $("#" + $.mobile.pageContainer.pagecontainer("getActivePage")[0].id).off('swiperight').on('swiperight', function () {
                        // check if there are no open panels, otherwise ignore swipe
//                        if (window.localStorage.getItem('panelLeft') !== "open" && window.localStorage.getItem('panelRight') !== "open") {
//                                togglePanel('#panelMenu' + currentId);
//                        }
//                });
        } else {
                // remove swipe event, because there is no page visible with a panelmenu
//                $("#" + $.mobile.pageContainer.pagecontainer("getActivePage")[0].id).off('swiperight');
        }
        showNonContextButtons('panel');
        // header title press effect (left panel)
        $("#headerTitle" + currentId).on('touchstart', function () {
                $(this).addClass("holoPressEffect");
        });
        $("#headerTitle" + currentId).on('touchend', function () {
                $(this).removeClass("holoPressEffect");
        });
        // overflow title press effect (right panel)
        $("#headerOverflow" + currentId).on('touchstart', function () {
                $(this).addClass("holoPressEffect");
        });
        $("#headerOverflow" + currentId).on('touchend', function () {
                $(this).removeClass("holoPressEffect");
        });
        // Search title press effect (right panel)
        $("#headerSearch" + currentId).on('touchstart', function () {
                $(this).addClass("holoPressEffect");
        });
        $("#headerSearch" + currentId).on('touchend', function () {
                $(this).removeClass("holoPressEffect");
        });
        // share press effect
                if (share === true) {
                $("#headerShare" + currentId).on('touchstart', function () {
                        $(this).addClass("holoPressEffect");
                });
                $("#headerShare" + currentId).on('touchend', function () {
                        $(this).removeClass("holoPressEffect");
                });
        }
}

// press effect in footer bar
function pressEffectFooter(button1, button2) {
        var currentId = window.localStorage.getItem("divIdGlobal");
        // button1 press effect
        if (button1 === true) {
                $("#footerShare" + currentId).on('touchstart', function () {
                        $(this).addClass("holoPressEffect");
                });
                $("#footerShare" + currentId).on('touchend', function () {
                        $(this).removeClass("holoPressEffect");
                });
        }
        // button2 press effect
        if (button2 === true) {
                $("#footerToast" + currentId).on('touchstart', function () {
                        $(this).addClass("holoPressEffect");
                });
                $("#footerToast" + currentId).on('touchend', function () {
                        $(this).removeClass("holoPressEffect");
                });
        }
}

// assign click events to elements
function htmlClickEventHandlers(id, action) {
        /** use action "menu" when using app icon as side panel (#panelMenu...)
        *        use action "back" when using app icon as back
        */
        // every page
        $('#headerTitle' + id).off("click").on("click",
                function () {
                        if (action !== "back") {
                                togglePanel('#panelMenu' + id);
                        } else {
                                window.history.back();
                        }
                });
        $('#headerShare' + id).off("click").on("click",
                function () {
//wird voruebergehend benutzt um Iframe zu Refreshen wenn Refresh also neuer ShareButton gedrueckt wird.
                SetLoader();
                document.getElementsByName("mainframe")[0].src = document.getElementsByName("mainframe")[0].src;
//erste ausgeklammerte Moeglichkeit mit Shareplugin, und zweite Ausgeklammerte Zeile fuer ShareIntern also nur Email
//                        window.plugins.socialsharing.share('Hi, schau dir mal Aktienfreunde.net an. Hier habe ich inzwischen mein Depot, meine Watchlists und meine Statistiken eingestellt und wuerde gern mit dir ueber Investitionen diskutieren und Tipps austauschen.', 'Aktienfreunde - Dein Wertpapierdepot auf einen Blick', null, 'http://aktienfreunde.net');
//                        share(window.localStorage.getItem('shareTagSubject'), window.localStorage.getItem('shareTagText'));
                });
        $('#headerShare' + id).on("taphold",
                function () {
//                        toast("Share.", "short");
                });
        $('#headerSearch' + id).off("click").on("click",
                function () {
                 if (document.getElementById("suchKiste1").style.visibility == "hidden") {
                                 if (screen.width < "750") {
                                         GoToSearch();
                                 } else {
                                 document.getElementById("suchKiste1").value="Name / ISIN suchen"; //stellt beim Sichtbarmachen wieder Standard her
                                 document.getElementById("suchKiste2").value="Name / ISIN suchen";
                                 document.getElementById("suchKiste3").value="Name / ISIN suchen";
                                 document.getElementById("suchKiste4").value="Name / ISIN suchen";
                                 document.getElementById("suchKiste1").style.visibility="visible"; //macht Sichtbar wenn vorher versteckt
                                 document.getElementById("suchKiste2").style.visibility="visible";
                                 document.getElementById("suchKiste3").style.visibility="visible";
                                 document.getElementById("suchKiste4").style.visibility="visible";
                                 document.getElementById("headerSearchService").src="./images/icons/ic_action_search_headerx.png";  //macht X hinter Suchfeld
                                 document.getElementById("headerSearchImpressum").src="./images/icons/ic_action_search_headerx.png";
                                 document.getElementById("headerSearchDatenschutz").src="./images/icons/ic_action_search_headerx.png";
                                 document.getElementById("headerSearchIndex").src="./images/icons/ic_action_search_headerx.png";
                                  }} else {
                                 document.getElementById("suchKiste1").style.visibility="hidden";     //Versteckt sie wenn Sichtbar
                                 document.getElementById("suchKiste2").style.visibility="hidden";
                                 document.getElementById("suchKiste3").style.visibility="hidden";
                                 document.getElementById("suchKiste4").style.visibility="hidden";
                                 document.getElementById("headerSearchService").src="./images/icons/ic_action_search_header.png";  //macht aus X wieder Lupe
                                 document.getElementById("headerSearchImpressum").src="./images/icons/ic_action_search_header.png";
                                 document.getElementById("headerSearchDatenschutz").src="./images/icons/ic_action_search_header.png";
                                 document.getElementById("headerSearchIndex").src="./images/icons/ic_action_search_header.png";
                           }
                });
        $('#headerSearch' + id).on("taphold",
                function () {

                });
        $('#headerOverflow' + id).off("click").on("click",
                function () {
                        togglePanel('#panelMenuRight' + id);
                });
        // specific page...
        if (id === "Index") {
                $('#clearFirstBoot').off("click").on("click",
                        function () {
                                clearFirstBoot();
                        });
        } else if (id === "Second") {
                // do nothing
        } else if (id === "Other") {
                // do nothing
        } else if (id === "Service") {
                initServiceSettings();
        }
        // every page but...
        if (id !== "Other") {
                $('#footerShare' + id).off("click").on("click",
                        function () {
                                share(window.localStorage.getItem('shareTagSubject'), window.localStorage.getItem('shareTagText'));
                        });
                $('#footerShare' + id).on("taphold", function () {
                        toast("Share.", "short");
                });
                $('#footerToast' + id).off("click").on("click", function () {
                        toast('This is a toast message', 'short');
                });
                $('#footerToast' + id).on("taphold", function () {
                        toast("Toast.", "short");
                });
        }
}

//GoToSearchPage verlinkt automatisch auf Suchenseite...wenn Display zu klein fuer Menuesuche oder wenn DeviceSearchButton gedrueckt wird
function GoToSearch() {
                         SetLoader();
                         window.location.href = "#indexPage";
                         document.getElementsByName("mainframe")[0].src="http://aktienfreunde.net/investment/newInvestment/?afForceMobile=true&afDisableMobileControls=true";
}

// initialize page variables and elements on create
function initPageVarsOnCreate(id) {
        // erste drei Zeilen auskommentiert - eventuell nuetzlich um HTML-Content upzudaten
        // every page
        // every page but...
        //if (id !== "Index") {
        //        toast('This is not the Index page', 'short');
        //}
        if (id !== "Other") {
                htmlClickEventHandlers(id, "menu");
        } else {
                htmlClickEventHandlers(id, "back");
        }
        // specific page...
        if (id === "Index") {
        //        isDeviceReady("valueTester", "toastReady");
        } else if (id === "Other") {
        //        // do nothing
        }
}

// initialize page variables on beforeshow
function initPageVarsOnShow(id) {
        // every page...
        resetPanelState();
        window.localStorage.setItem("divIdGlobal", id);
        window.localStorage.setItem("shareTagSubject", 'Tipp zur Depotanalyse');
        window.localStorage.setItem("shareTagText", 'Schau dir mal Aktienfreunde.net an und teste die kostenlose Online Depotverwaltung zur Performanceberechnung und Analyse der eigenen Finanzen!');
        panelMenu(id);
        panelMenuRight(id);
        panelHandling();
        // every page but...
        if (id !== "Other") {
                pressEffectHeader(true, "menu");
        } else {
                pressEffectHeader(true, "back");
        }
        // specific page...
        if (id === "Index") {
                pressEffectFooter(true, true);
        } else if (id === "Other") {
                pressEffectFooter(true, true);
                getSystemSpecs();
        } else if (id === "Service") {
                pressEffectFooter(true, true);
                androidServiceHandler("getStatus", "none");
        }
}

// below is to tie page events to pages so that the 2 functions above (initPageVarsOn...) will execute

// store important vars, like previous page id
function startBeforeShowVars(data) {
        window.localStorage.setItem("previousPageId", data.prevPage.attr("id"));
}

// #indexPage
$(document).on('pagebeforeshow', '#indexPage', function (event, data) {
        startBeforeShowVars(data);
        initPageVarsOnShow('Index');
});
$(document).on('pagecreate', '#indexPage', function () {
        initPageVarsOnCreate('Index');
});

// #servicePage
$(document).on('pagebeforeshow', '#servicePage', function (event, data) {
        startBeforeShowVars(data);
        initPageVarsOnShow('Service');
});
$(document).on('pagecreate', '#servicePage', function () {
        initPageVarsOnCreate('Service');
});

// #impressumPage
$(document).on('pagebeforeshow', '#impressumPage', function (event, data) {
        startBeforeShowVars(data);
        initPageVarsOnShow('Impressum');
});
$(document).on('pagecreate', '#impressumPage', function () {
        initPageVarsOnCreate('Impressum');
});

// #datenschutzPage
$(document).on('pagebeforeshow', '#datenschutzPage', function (event, data) {
        startBeforeShowVars(data);
        initPageVarsOnShow('Datenschutz');
});
$(document).on('pagecreate', '#datenschutzPage', function () {
        initPageVarsOnCreate('Datenschutz');
});

//verarbeitet die bei der GCMRegistrierung erhaltene RegID fuer PushServices und leitet diese weiter an eigenen MessageServer
function sendRegID() {
         document.getElementById('inforegid').innerHTML = pushRegID;  //zeigt das ganze in den Einstellungen an
         //hier kommt der Code zum senden an Datenbank hin
         //liest BellUser aus und wenn ungleich leer schickt zur RegId auch username
}

function deleteRegID() {
 //Sendet loeschen Befehl an Server
 //
}

function triggerClosingBellButton() {
         if ($('#bellStatus').val() === 'on') {
         //wenn trigger auf aus gesetzt wird wird grundsaetzlich die RegID geloescht
         //dabei wird in lokaler value 5 vermerkt dass 0 also kein wunsch
         window.localStorage.setItem("key5", "0");
         deleteRegID();
         } else {
         //wenn trigger auf an gesetzt wird wird sendRegID gestartet
         //dabei wird in lokaler value 5 vermerkt das 1 also wunsch besteht
         window.localStorage.setItem("key5", "1");
         sendRegID();
         }
}

function ClosingBellFirstLoad() {
//Funktion die beim AppStart prueft ob value 5 auf 0 steht,
//wenn ja dann darf nichts passieren
//trigger muss auf aus geschaltet werden
//wenn nein, oder nicht existent muss value 5 auf 1 gesetzt werden
//danach muss trigger auf ein geschaltet werden
         var value5 = window.localStorage.getItem("key5");
         if (value5 == '0') {
         $("#bellStatus").val("on").flipswitch("refresh"); //Stellt Switch auf OFF
         } else {
         window.localStorage.setItem("key5", "1");
         value5 = '1';
         $("#bellStatus").val("off").flipswitch("refresh"); //Stellt Switch auf AN
         sendRegID();
         }
}


//wenn username gespeichert und der button vom speichern auf 1 ist und GetPass durchgelaufen ist
//muss der username noch an die BellUser uebergeben werden
//wenn username geloescht wird muss BellUser geleert werden, RegID geloescht werden und sendRegId neu aufgerufen werden
