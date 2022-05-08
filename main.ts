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

				const request = {
					url: "http://localhost:8088/run",
					method: "POST",
					contentType: "application/json",
					headers: {"X-Access-Token": "obsidian-token"},
					body: JSON.stringify({
						image: `glot/${language}:latest`,
						payload: {
							"language": language,
							"files": [{
								"name": "executionFile",
								"content": codeBlock.getText()
							}]
						},
					})
				};
				console.log(request);
				const response = requestUrl(request);

				response.then(response => {
					console.log(response.json);
					const responseJson = response.json;

					const outputElement = document.createElement("code");
					outputElement.addClass("codeExecutionOutput");

					const stdoutElement = document.createElement("span");
					stdoutElement.addClass("stdout");
					stdoutElement.setText(responseJson.stdout);

					const stderrElement = document.createElement("span");
					stderrElement.addClass("stderr");
					stderrElement.setText(responseJson.stderr);

					outputElement.appendChild(stdoutElement);
					outputElement.appendChild(stderrElement);

					const buttonsContainer = document.createElement("div");
					buttonsContainer.addClass("buttons-container")

					const runButton = document.createElement("button");
					runButton.addClass("ocr-button");
					runButton.setText("> Run");

					const clearButton = document.createElement("button");
					clearButton.addClass("ocr-button");
					clearButton.setText("Clear");

					buttonsContainer.appendChild(runButton);
					buttonsContainer.appendChild(clearButton);

					codeBlock.parentElement.appendChild(buttonsContainer);
					codeBlock.parentElement.appendChild(document.createElement("hr"));
					codeBlock.parentElement.appendChild(outputElement);
				});
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
