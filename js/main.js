// DATA
var tasks = [
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
	},
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
	}
]

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
	template: "#task-link-body",
	methods: {
		switchTab(tab) {
			this.$root.switchTab(tab)
		}
	}
})

// TASK COMPONENT
Vue.component("task", {
	props: ["item"],
	template: "#task-body",
	data() {
		return {
			content: null,
			test: {
				results: null,
				success: 0,
				fail: 0
			}
		}
	},
	created() {
		this.$on("change-content", content => {
			this.content = content;
		})
	},
	methods: {
		switchTab(tab) {
			this.$root.switchTab(tab)
		},
		runTests() {
			var data;
			var output;
			var input;
			var status

			this.$root.tab = "result";
			this.test.results = [];
			this.test.success = 0;
			this.test.fail = 0;

			this.item.tests.forEach(test => {
				data = test.input;

				if(typeof data === "string") data = "'" + data + "'";

				input = eval(this.content + this.item.function.name + "(" + data + ")");
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
  	props: ["identifier", "item"],
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
					alert('Well done ! You are now connection ' + data.user.email);
					this.$root.request = false;
					this.$router.replace('/');
				},
				err => {
					alert('Oops. ' + err.message);
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
			name: "",
			email: "",
			password: ""
		}
	},
	methods: {
		register: function() {
			if(firebase) this.$root.request = true;

			firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(
				data => {
					alert("Your account has been created ! " + data.user.email);
					this.$root.request = false; 
					this.$router.replace('/');
				},
				err => {
					alert("Oops. " + err.message);
					this.$root.request = false;
				}
			)
		}
	}
})

// ROUTER
var routes = [
	{ path: "*", redirect: "/" },
	{ path: "/", component: { template: '#home' } },
	{ path: "/tasks", component: { template: '#tasks' } },
	{ path: "/tasks/:id", component: { template: "#task" } },
	{ path: "/registration", component: registration },
	{ path: "/login", component: login  }
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
		isHidden: false
	},
	methods: {
		switchTab(tab) {
			this.tab = tab;
		},
		showMobileNav() {
			this.mobileNav = !this.mobileNav;
		},
		logout() {
			firebase.auth().signOut().then(() => {
				this.isAuthorized = false;
			})
		}
	},
	created: function() {
		firebase.initializeApp(firebaseConfig);

		firebase.auth().onAuthStateChanged((user) =>{
			if(user) {
				this.isAuthorized = true;
				//this.isHidden = true;
			}
		});

		this.isHidden = true;
	}
})