/**
 * Main loop for the PJP site, this is where everything starts. * 
 * @class
 * @author Alan Wu
 * @returns {PJP.Main}
 */
PJP.Main = function()  {
	var bodyViewer = undefined;
	var organsViewer = undefined;
	var tissueViewer = undefined;
	var cellPanel = undefined;
	var modelPanel = undefined;
	var modelsLoader = undefined;
	this.apinatomyPanel = undefined;
	this.topPanel = undefined;
	this.showApinatomyButton = undefined;
	this.hideApinatomyButton = undefined;
	var UIIsReady = true;
	this.apinatomyIsDisplayed = true;
	var _this = this;
	this.DOM = [];
	
	var systemMetaReadyCallback = function() {
		return function() {
			bodyViewer.readSystemMeta();
		}
	}
	
	/**
	 * Initialise all the panels required for PJP to function correctly.
	 * Modules used incude - {@link PJP.ModelsLoader}, {@link PJP.BodyViewer},
	 * {@link PJP.OrgansViewer}, {@link PJP.TissueViewer}, {@link PJP.CellPanel}
	 * and {@link PJP.ModelPanel}.
	 */
	var initialiseMain = function() {
		modelsLoader = new PJP.ModelsLoader();
		bodyViewer = new PJP.BodyViewer(modelsLoader, "bodyDisplayPort");
		organsViewer = new PJP.OrgansViewer(modelsLoader, "organsDisplayPort");
		tissueViewer = new PJP.TissueViewer("tissueDisplayPort");
		cellPanel = new PJP.CellPanel("cellDisplayPort");
		modelPanel = new PJP.ModelPanel("modelDisplayPort");
		modelPanel.enableSVGController('testsvg');
		_this.apinatomyPanel = document.getElementById("apinatomyDisplayPort");
		_this.topPanel = document.getElementById("topPanel");
		_this.showApinatomyButton = document.getElementById("showApinatomyButton");
		_this.hideApinatomyButton = document.getElementById("hideApinatomyButton");
		modelsLoader.addSystemMetaIsReadyCallback(systemMetaReadyCallback());
		modelsLoader.initialiseLoading();
		bodyViewer.setOrgansViewer(organsViewer);
		organsViewer.setTissueViewer(tissueViewer);
		organsViewer.setCellPanel(cellPanel);
		organsViewer.setModelPanel(modelPanel);
		tissueViewer.setCellPanel(cellPanel);
		tissueViewer.setModelPanel(modelPanel);
	}
	
	var expandCollapseApinatomy = function(source, portName) {
		if (source.value == "Expand")
			resetExpandButton();
		expandCollapse(source, portName);
		if (source.value == "Expand") {
			main.apinatomyPanel.className = "apinatomyDisplayPortCollapse";
			main.hideApinatomyButton.style.visibility = "visible";
		} else {
			main.hideApinatomyButton.style.visibility = "hidden";
		}
		window.dispatchEvent(new Event('resize'));
	};

	var showApinatomy = function() {
		main.apinatomyPanel.style.visibility = "visible";
		main.hideApinatomyButton.style.visibility = "visible";
		main.apinatomyIsDisplayed = true;
		main.topPanel.className = "topPanelCollapse";
		main.showApinatomyButton.style.visibility = "hidden";
	};

	var hideApinatomy = function() {
		main.apinatomyPanel.style.visibility = "hidden";
		main.hideApinatomyButton.style.visibility = "hidden";
		main.apinatomyIsDisplayed = false;
		main.topPanel.className = "topPanelExpand";
		main.showApinatomyButton.style.visibility = "visible";
	};
	
	var addUICallback = function() {
		_this.hideApinatomyButton.onclick = function() { hideApinatomy() };
		_this.showApinatomyButton.onclick = function() { showApinatomy() };
		var callbackElement = document.getElementById("apinatomyScreenButton");
		callbackElement.onclick = function() { expandCollapseApinatomy(callbackElement, 'apinatomyDisplayPort'); };
	}
	
	var loadHTMLComplete = function(link) {
		return function(event) {
			var localDOM = document.body;
			var childNodes = null;
			if (link.import.body !== undefined)
				childNodes = link.import.body.childNodes;
			else if (link.childNodes !== undefined)
				childNodes = link.childNodes;
			for (i = 0; i < childNodes.length; i++) {
				localDOM.appendChild(childNodes[i]);
			}
			initialiseMain();
			document.head.removeChild(link);
			addUICallback();
			UIIsReady = true;
		}
	}
	
	var initialise = function() {
		var link = document.createElement('link');
		link.rel = 'import';
		link.href = 'snippets/main_with_apinatomy.html';
		link.onload = loadHTMLComplete(link);
		link.onerror = loadHTMLComplete(link);
		document.head.appendChild(link);	
	}

	initialise();
}


