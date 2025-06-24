const ViewClass = Java.use("android.view.View");
const ProcessClass = Java.use("android.os.Process");
const ViewGroupClass = Java.use('android.view.ViewGroup');
const EditTextClass = Java.use("android.widget.EditText");
const ButtonClass = Java.use('android.widget.Button');
const ArrayListClass = Java.use("java.util.ArrayList");
const StringClass = Java.use("java.lang.String");
const BufferType = Java.use('android.widget.TextView$BufferType');
const CharSequenceClass = Java.use("java.lang.CharSequence");
const ThreadClass = Java.use('java.lang.Thread');
var Flag; // "Thanks for all the fish";
var tmpFlag = "x";
const FLAG_MAX_LENGTH = 32;
var wasExecuted = false;



if (Java.available) {
	Java.perform( function() {
		console.log("\n[*] PID: ", ProcessClass.myPid());
		console.log("[*] Starting script...");

		root_protection_bypass();
		debug_protection_bypass();

		add_logging_to_CodeCheck_func();  // for debug 
		set_interceptor();

		bruteforce_flag_cli();
		// bruteforce_flag_ui();
	});
}
else {
	console.log("\n[!] Java is not defined");
}



function kill() {
    ProcessClass.killProcess(ProcessClass.myPid());
}



function root_protection_bypass() {
	const CheckRootAccessClass = Java.use("sg.vantagepoint.a.b");
	CheckRootAccessClass.a.implementation = function() {
		console.log("[*] Bypassing root check A");
		return false;
	};
	CheckRootAccessClass.b.implementation = function() {
		console.log("[*] Bypassing root check B");
		return false;
	};
	CheckRootAccessClass.c.implementation = function() {
		console.log("[*] Bypassing root check C");
		return false;
	};
}




function debug_protection_bypass() {
	const CheckDebugModeClass = Java.use("sg.vantagepoint.a.a");
	CheckDebugModeClass.a.implementation = function() {
		console.log("[*] Bypassing that application is debuggable");
		return false;
	};

	const AsyncTaskClass = Java.use("sg.vantagepoint.uncrackable2.MainActivity$2");
	AsyncTaskClass.a.overload('[Ljava.lang.Void;').implementation = function(VoidArr) {
		console.log("[*] Bypassing connected debugger");
		const SystemClockClass = Java.use("android.os.SystemClock");
		SystemClockClass.sleep(100000000);
		return null;
	};

	// Another way to bypass debug
	// let Debug = Java.use("android.os.Debug");
	// Debug.isDebuggerConnected.implementation = function() {
	// 	console.log("[*] Bypassing connected debugger");
	//     return false;
	// };
}



function add_logging_to_CodeCheck_func() {
	const CodeCheckClass = Java.use("sg.vantagepoint.uncrackable2.CodeCheck");
	CodeCheckClass.a.implementation = function(str) {
		console.log("[debug] CodeCheck.a()");
		return this.a(str);
	};
}




function bruteforce_flag_cli() {
	const MainActivityClass = Java.use("sg.vantagepoint.uncrackable2.MainActivity");
	const CodeCheckClass = Java.use("sg.vantagepoint.uncrackable2.CodeCheck");

	MainActivityClass.onWindowFocusChanged.implementation = function(hasFocus) {
		var codeCheckInstance;
		
		this.onWindowFocusChanged(hasFocus);
		console.log("[debug] onWindowFocusChanged()");


		Java.choose(CodeCheckClass.$className, {
			onMatch: function(instance) {
				codeCheckInstance = instance;
			},
			onComplete: function() {}
		});
		

		for (let length = 1; length < FLAG_MAX_LENGTH; length++) {
			tmpFlag = "x".repeat(length);
			console.log(`[*] Used template: ${tmpFlag.length} ${tmpFlag}`);

			codeCheckInstance.a(tmpFlag);

			if (Flag) {
				console.log("[FLAG] Flag found:", Flag);
				break;
			}
		}
	};
	
}


function bruteforce_flag_ui() {
	const MainActivityClass = Java.use("sg.vantagepoint.uncrackable2.MainActivity");

	MainActivityClass.onWindowFocusChanged.implementation = function(hasFocus) {
		var mainActivityInstance;
		var editTextInstance;
		var buttonInstance;
		let handledDialogs = [];


		// Without this program does't work
		const CodeCheckClass = Java.use("sg.vantagepoint.uncrackable2.CodeCheck");
		var codeCheckInstance;
		Java.choose(CodeCheckClass.$className, {
			onMatch: function(instance) {
				codeCheckInstance = instance;
			},
			onComplete: function() {}
		});
		codeCheckInstance.a(tmpFlag);
		


		this.onWindowFocusChanged(hasFocus);
		console.log("[debug] onWindowFocusChanged()");

		
		if (!wasExecuted) {
			console.log("[!] Main UI logic....")
			wasExecuted = true;

			Java.choose(MainActivityClass.$className, {
				onMatch: function(activity) {
					mainActivityInstance = activity;
					let res = activity.getResources();
					let buttonTextId = res.getIdentifier("button_verify", "string", activity.getPackageName());
					let buttonText = res.getString(buttonTextId);

					let rootView = activity.getWindow().getDecorView();
					let viewGroup = Java.cast(rootView, ViewGroupClass);
					var allViews = ArrayListClass.$new();
					buttonText = StringClass.$new(buttonText);
					viewGroup.findViewsWithText(allViews,buttonText,ViewClass.FIND_VIEWS_WITH_TEXT.value);
					buttonInstance = Java.cast(allViews.get(0), ButtonClass);



					let editTextId = res.getIdentifier("edit_text", "id", activity.getPackageName());
					editTextInstance = Java.cast(activity.findViewById(editTextId), EditTextClass);
				},
				onComplete: function() {}
			});
			
			
			Java.perform(() => run_ui_interaction(editTextInstance, mainActivityInstance, buttonInstance, handledDialogs));

		}
	};
}


async function run_ui_interaction(editTextInstance, mainActivityInstance, buttonInstance, handledDialogs) {
	var text;
	for (let length = 2; length < FLAG_MAX_LENGTH; length++) {
		if (Flag) {
			tmpFlag = Flag;
		} else {
			tmpFlag = "x".repeat(length);
		}
		

		await new Promise( resolve => {
			Java.scheduleOnMainThread( function() {
				editTextInstance.setText(StringClass.$new(tmpFlag), BufferType.NORMAL.value);
				editTextInstance.postInvalidate();

				var textObj = editTextInstance.getText();
				text = Java.cast(textObj, CharSequenceClass).toString();
				resolve();
			});
		});
		await new Promise(r => setTimeout(r, 500));
		console.log("[*] Entered text:", tmpFlag.length, text);


		await new Promise( resolve => {
			Java.scheduleOnMainThread( function() {
				mainActivityInstance.verify(buttonInstance);
				resolve();
			});
		});
		await new Promise(r => setTimeout(r, 500));
		console.log("[debug] Click on verify button");
		

		if (Flag && tmpFlag === Flag) {
			break;
		}


		await new Promise( resolve => {
			Java.choose("android.app.AlertDialog", {
				onMatch: function(dialog) {
					let dialogHash = dialog.hashCode();
					let button = dialog.getButton(-3);
					if (button && !handledDialogs.includes(dialogHash)) {
						Java.scheduleOnMainThread( function() {
							button.performClick();
						});
						handledDialogs.push(dialogHash);
					}
				},
				onComplete: function() {}
			});
			resolve();
		});
		await new Promise(r => setTimeout(r, 500));
		console.log("[debug] Click on alert dialog button");
	}

	console.log("[FLAG] Flag found:", Flag);
}



function set_interceptor() {
	const libc = Module.load("/system/lib/libc.so");
	const strncmpPtr = libc.findExportByName("strncmp");

				
	Interceptor.attach(strncmpPtr, {
		onEnter: function(args) {
			let arg1 = args[0].readCString(tmpFlag.length);
			let arg2 = args[1].readCString();
			if (arg1 === tmpFlag || arg2 === tmpFlag) {
				console.log(`[*] strncmp("${arg1}", "${arg2}", ${args[2].toInt32()})`);
				Flag = /[^x]/.test(arg1) ? arg1 : arg2;
			}
		}
	});
}