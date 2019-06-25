// DATA
var tasks = [
	{
		caption: "Перевернуть строку",
		description: "Напишите функцию по развороту строки",
		status: false,
		function: {
			name: "reverseString",
			body: "function reverseString(str) { return str.split('').reverse().join('') }"
		},
		tests: [
			{
				input: "Hello",
				output: "olleH"
			},
			{
				input: "apple",
				output: "elppa"
			},
			{
				input: "I love Javascript",
				output: "tpircsavaJ evol I"
			}
		]
	},
	{
		caption: "Факториал",
		description: "Напишите функцию по подсчету факториала",
		status: false,
		function: {
			name: "fact",
			body: "function fact(n) { return 120 }"
		},
		tests: [
			{
				input: 5,
				output: 120
			},
			{
				input: 6,
				output: 720
			},
			{
				input: 7,
				output: 5040
			},
			{
				input: 8,
				output: 40320
			},
			{
				input: 9,
				output: 362880
			}
		]
	}
]

// MESSAGES
var messages = {
	error: {
		nicknameIsBusy: "Данный ник занят",
		firebase: {
			"auth/invalid-email": "Введите корректный e-mail",
			"auth/weak-password": "Пароль должен быть не менее 6 символов.",
			"auth/email-already-in-use": "Адрес электронной почты уже используется другой учетной записью."
		}
	}
}

// FIREBASE CONFIG
var firebaseConfig = {
	apiKey: "AIzaSyCJMPQ89hdBBVw7BaytzHuKM_X8thoEy_Y",
	authDomain: "jsbattle-20e89.firebaseapp.com",
	databaseURL: "https://jsbattle-20e89.firebaseio.com",
	projectId: "jsbattle-20e89",
	storageBucket: "jsbattle-20e89.appspot.com",
	messagingSenderId: "503959691750",
	appId: "1:503959691750:web:35c5357eb338b25c"
};


// TASK-LINK COMPONENT
Vue.component("task-link", {
	props: ["item", "index"],
	template: "#task-link-body"
})

// TASK COMPONENT
var task = Vue.component("task", {
	template: "#task",
	data() {
		return {
			task: null,
			content: null,
			test: {
				results: null,
				success: 0,
				fail: 0
			}
		}
	},
	created() {
		this.task = this.$root.tasks[this.$route.params.id];
		this.$on("change-content", content => {
			this.content = content;
		})
	},
	methods: {
		runTests() {
			var data;
			var output;
			var input;
			var status

			this.$root.tab = "result";
			this.test.results = [];
			this.test.success = 0;
			this.test.fail = 0;

			this.task.tests.forEach(test => {
				data = test.input;

				if(typeof data === "string") data = "'" + data + "'";

				input = eval(this.content + this.task.function.name + "(" + data + ")");
				output = test.output;

				if(input === output) {
					status = true;
					this.test.success++;
				} else {
					status = false;
					this.test.fail++;
				}
				
				this.test.results.push({ return: input, output: output, status: status });
			})
			// check all test
			//console.log(this.test.results.every(i => i.status))
		}
	}
})

// EDITOR COMPONENT
Vue.component("editor", {
  	props: ["identifier", "task"],
	template: "#editor-body",
  	data() {
    	return {
      		el: null
    	}
  	},
  	mounted() {
		this.el = window.ace.edit(this.identifier);
    	this.el.getSession().setMode("ace/mode/javascript");
    	this.el.setTheme("ace/theme/monokai");
    	this.el.setOption("highlightActiveLine", false);
    	this.el.setShowPrintMargin(false);
    	this.$parent.$emit('change-content', this.el.getValue());

    	this.el.on('change', () => {
    		this.$parent.$emit('change-content', this.el.getValue());
    	})
  	}
})

// LOGIN
var login = Vue.component("login", {
	template: "#login",
	data() {
		return {
			email: "",
			password: ""
		}
	},
	methods: {
		login: function() {
			if(firebase) this.$root.request = true;

			firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(
				data => {
					this.$root.request = false;
					this.$router.replace('/');
				},
				error => {
					alert('Oops. ' + error.message);
					this.$root.request = false;
				}
			)
		}
	}
})

// REGISTRATION
var registration = Vue.component("registration", {
	template: "#registration",
	data() {
		return {
			nickname: "",
			email: "",
			password: "",
			warning: "",
			isWarning: false
		}
	},
	watch: {
		nickname() {
			this.warning = "";
			this.isWarning = false;
		}
	},
	methods: {
		checkNickname(nickname) {
			return firebase.firestore().collection("users").doc(nickname.toLowerCase()).get().then(data => {
				if(data.exists) {
					// Если ник занят
					return false
				} else {
					// Если ник свободен
					return true
				}
			})
		},
		register() {
			if(firebase) this.$root.request = true;

			this.checkNickname(this.nickname).then(
				nicknameIsFree => {
					if(nicknameIsFree) {
						this.warning = "";
						this.isWarning = false;
						this.createUser();

						return true;
					} else {
						this.warning = messages.error.nicknameIsBusy
						this.isWarning = true;
						this.$root.request = false;

						return false;
					}
				}
			)
		},
		createUser() {
			// Убираем слушателя Auth так как он срабатывает сразу после регистрации но до загрузки данных
			this.$root.removeAuthListener();
			firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(
				data => {
					this.updateProfile();
					this.$root.request = false;
					this.$router.replace('/');
				},
				error => {
					this.warning = messages.error.firebase[error.code];
					this.isWarning = true;
					this.$root.request = false;
				}
			)
		},
		updateProfile() {
			var user = firebase.auth().currentUser;
			var data = {
				id: user.uid,
				nickname: this.nickname.toLowerCase(),
				tasks: []
			}

			user.updateProfile({
				displayName: this.nickname.toLowerCase()
			}).then(() => {
				firebase.firestore().collection("users").doc(this.nickname.toLowerCase()).set(data).then(
					() => {
						this.$root.onAuthListener();
					}
				);
			})
		}
	}
})

// USER
var user = Vue.component("user", {
	template: "#user",
	data() {
		return {
			nickname: null,
			avatar: null,
			defaultAvatar: "img/default-avatar.png",
			notFound: false
		}
	},
	watch:{
    	$route(){
        	this.getUserData();
    	}
	},
	methods: {
		logout() {
			firebase.auth().signOut().then(
				() => {
					this.$root.isAuthorized = false;
					this.$router.replace("/");
				}
			)
		},
		checkNickname(nickname) {
			return firebase.firestore().collection("users").doc(nickname.toLowerCase()).get().then(data => data.exists);
		},
		getUserData() {
			var userData;
			this.notFound = false;
			this.nickname = null;

			this.checkNickname(this.$route.params.nickname).then(
				nickname => {
					if(nickname) {
						firebase.firestore().collection("users").doc(this.$route.params.nickname).get().then(
							data => {
								userData = data.data();
								this.nickname = userData.nickname;
								this.avatar = userData.photoURL;
							}
						)
					} else {
						this.notFound = true;
					}
				}
			)
		}
	},
	created() {
		this.getUserData();
	}
})

// SETTINGS
var settings = Vue.component("settings", {
	template: "#settings",
	data() {
		return {}
	},
	created() {
		console.log(this)
	}
})

// ROUTER
var routes = [
	{ path: "*", redirect: "/" },
	{ path: "/", component: { template: '#home' } },
	{ path: "/tasks", component: { template: '#tasks' } },
	{ path: "/tasks/:id", component: task },
	{ path: "/registration", component: registration },
	{ path: "/login", component: login, meta: { requiresAuth: true } },
	{ path: "/user/:nickname", component: user },
	{ path: "/user/:nickname/settings", component: settings }
];

var router = new VueRouter({ routes });

// VUE INSTANCE
var app = new Vue({
	el: "#app",
	router: router,
	data: {
		tasks: tasks,
		tab: "task",
		mobileNav: false,
		request: false,
		isAuthorized: false,
		isPreloader: false,
		nickname: null,
		uid: null,
		removeAuthListener: null
	},
	methods: {
		switchTab(tab) {
			this.tab = tab;
		},
		toggleMobileNav() {
			this.mobileNav = !this.mobileNav;
		},
		getUserData(nickname) {
			return firebase.firestore().collection("users").doc(nickname).get();
		},
		onAuthListener() {
			this.isPreloader = true;
			
			this.removeAuthListener = firebase.auth().onAuthStateChanged(user => {
				var userData;

				if(user) {
					this.isAuthorized = true;
					this.getUserData(user.displayName).then(
						data => {
							userData = data.data();
							this.nickname = userData.nickname;
							this.uid = userData.id;
						}
					)
				}

				this.isPreloader = false;
			});
		}
	},
	created: function() {
		firebase.initializeApp(firebaseConfig);
		this.onAuthListener();
	}
})