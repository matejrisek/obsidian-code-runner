import {Plugin, requestUrl} from 'obsidian';

interface CodeRunnerPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: CodeRunnerPluginSettings = {
	mySetting: 'default'
}

export default class CodeRunnerPlugin extends Plugin {
	settings: CodeRunnerPluginSettings;

	async onload() {
		await this.loadSettings();

		console.log("Registering...");
		await this.registerRunner(document.body);
		this.registerMarkdownPostProcessor((element, _context) => {
			this.registerRunner(element);
		});
	}

	private requestUrlParam: any;

	private async registerRunner(element: HTMLElement) {
		element.querySelectorAll("code")
			.forEach((codeBlock: HTMLElement) => {
				const language = codeBlock.className.toLowerCase().replace("language-", "");
				console.log("language: " + language);
				if (language.length < 1) return;

				// const response = requestUrl({
				// 	url: "http://localhost:8088/version",
				// 	method: "GET",
				// 	headers: {"X-Access-Token": "obsidian-token"}
				// });
				//
				// response.then(res => console.log(res.json));

				console.log("ENTERING");
				const response = requestUrl({
					url: "http://localhost:8088/run",
					method: "POST",
					contentType: "application/json",
					headers: {"X-Access-Token": "obsidian-token"},
					body: JSON.stringify({
						image: `glot/${language}:latest`,
						payload: {
							"language": language,
							"files": [{
								"name": "file",
								"content": codeBlock.getText()
							}]
						},
					})
				});
				console.log("EXITING")
				console.log(response);
				response.then(response => console.log(response.json));
			});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}
