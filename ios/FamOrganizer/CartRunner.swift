import Foundation
import WebKit
import UIKit

struct AddPlanItem: Codable {
	let productUrl: String
	let qty: Int
}

struct AddPlan: Codable {
	let retailer: String // "woolworths" | "coles"
	let items: [AddPlanItem]
}

final class LeakFreeScriptHandler: NSObject, WKScriptMessageHandler {
	weak var delegate: CartRunner?

	init(delegate: CartRunner) {
		self.delegate = delegate
		super.init()
	}

	func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
		guard message.name == "cartProgress" else { return }
		delegate?.handleScriptMessage(message.body)
	}
}

final class CartRunner: NSObject, WKNavigationDelegate {
	private let webView: WKWebView
	private var queue: [AddPlanItem] = []
	private var current: AddPlanItem?
	private var retriesLeftForCurrent: Int = 0
	private var retailer: String = "woolworths"

	// Callbacks
	var onProgress: ((String) -> Void)?
	var onError: ((Error) -> Void)?
	var onDone: (() -> Void)?

	override init() {
		let cfg = WKWebViewConfiguration()
		cfg.preferences.javaScriptEnabled = true
		cfg.websiteDataStore = .default()
		let handlerOwner = WKUserContentController()
		let dummy = WKUserScript(source: "window._homehub = true;", injectionTime: .atDocumentEnd, forMainFrameOnly: true)
		handlerOwner.addUserScript(dummy)
		// Leak-free wrapper
		let tempWebView = WKWebView(frame: .zero, configuration: cfg)
		self.webView = tempWebView
		super.init()
		let leakFree = LeakFreeScriptHandler(delegate: self)
		handlerOwner.add(leakFree, name: "cartProgress")
		self.webView.configuration.userContentController = handlerOwner
		self.webView.navigationDelegate = self
	}

	func attach(to view: UIView) {
		webView.translatesAutoresizingMaskIntoConstraints = false
		view.addSubview(webView)
		NSLayoutConstraint.activate([
			webView.topAnchor.constraint(equalTo: view.topAnchor),
			webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
			webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
			webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
		])
	}

	func start(plan: AddPlan) {
		self.retailer = plan.retailer
		self.queue = plan.items
		onProgress?("Starting add-to-cart for \(queue.count) items…")
		next()
	}

	private func next() {
		guard !queue.isEmpty else { notifyDone(); return }
		current = queue.removeFirst()
		retriesLeftForCurrent = 2
		guard let product = current, let url = URL(string: product.productUrl) else { advanceAfterDelay(); return }
		onProgress?("Loading product page…")
		let req = URLRequest(url: url)
		webView.load(req)
	}

	private func advanceAfterDelay(_ delay: TimeInterval = 0.8) {
		DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
			self?.next()
		}
	}

	func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
		guard let item = current else { return }
		injectAddScript(for: item)
	}

	func handleScriptMessage(_ body: Any) {
		// Optional: handle progress pings from JS
		if let dict = body as? [String: Any], let msg = dict["msg"] as? String {
			onProgress?(msg)
		}
	}

	private func injectAddScript(for item: AddPlanItem) {
		let js = Self.jsAddTemplate(qty: item.qty)
		webView.evaluateJavaScript(js) { [weak self] result, error in
			guard let self = self else { return }
			if let error = error {
				if self.retriesLeftForCurrent > 0 {
					self.retriesLeftForCurrent -= 1
					self.onProgress?("Retrying add… (\(2 - self.retriesLeftForCurrent)/3)")
					DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
						self.injectAddScript(for: item)
					}
					return
				}
				self.onError?(error)
				self.advanceAfterDelay()
				return
			}
			// Optional: parse result
			self.advanceAfterDelay(0.8)
		}
	}

	private func notifyDone() {
		onProgress?("All items processed. You can continue to checkout in this tab.")
		onDone?()
	}
}

extension CartRunner {
	static func jsAddTemplate(qty: Int) -> String {
		let raw = """
		(() => {
		  const sleep = ms => new Promise(r => setTimeout(r, ms));
		  async function addOnce() {
		    const selectors = [
		      "button[data-test='add-to-cart']",
		      "button[aria-label*='Add to trolley']",
		      "button:has([data-icon='plus'])",
		      "button[aria-label*='add' i]"
		    ];
		    let btn;
		    for (const s of selectors) { btn = document.querySelector(s); if (btn) break; }
		    if (btn) { btn.click(); return "CLICKED_BTN"; }
		    const variantBtn = document.querySelector("button[data-test='select-variant']");
		    if (variantBtn) { variantBtn.click(); await sleep(300);
		      const firstOption = document.querySelector("[role='dialog'] [role='option']");
		      if (firstOption) { firstOption.click(); await sleep(200); }
		      const addInDialog = document.querySelector("[role='dialog'] button[type='submit']");
		      if (addInDialog) { addInDialog.click(); return "CLICKED_VARIANT"; }
		    }
		    const form = document.querySelector("form[action*='add']") || document.querySelector("form[data-action*='add']");
		    if (form) {
		      const fd = new FormData(form);
		      const action = form.getAttribute("action");
		      const res = await fetch(action, { method: "POST", body: fd, credentials: "include" });
		      return res.ok ? "FETCH_OK" : "FETCH_FAIL";
		    }
		    return "NO_CONTROL";
		  }
		  async function addQty(qty) {
		    const incSel = "button[data-test='increment'], button[aria-label*='increase']";
		    for (let i = 1; i < qty; i++) {
		      const inc = document.querySelector(incSel);
		      if (inc) { inc.click(); await sleep(150); }
		    }
		  }
		  return (async () => {
		    const result = await addOnce();
		    await addQty(__QTY__);
		    try { window.webkit?.messageHandlers?.cartProgress?.postMessage({ msg: 'addedAttempt:' + String(result) }); } catch(e) {}
		    return result;
		  })();
		})();
		"""
		return raw.replacingOccurrences(of: "__QTY__", with: "\(qty)")
	}
}


