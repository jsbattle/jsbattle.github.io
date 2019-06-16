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

// ROUTER
var routes = [
	{ path: "/", component: { template: '#home' } },
	{ path: "/tasks", component: { template: '#tasks' } },
	{ path: "/task/:id", component: { template: "#task" } },
];

var router = new VueRouter({ routes })

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

// VUE INSTANCE
var app = new Vue({
	el: "#app",
	router: router,
	data: {
		tasks: tasks,
		tab: "task",
		mobileNav: false
	},
	methods: {
		switchTab(tab) {
			this.tab = tab;
		},
		showMobileNav() {
			this.mobileNav = !this.mobileNav;
		}
	}
})