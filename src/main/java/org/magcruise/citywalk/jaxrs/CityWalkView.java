package org.magcruise.citywalk.jaxrs;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;

import javax.ws.rs.Path;

import org.glassfish.jersey.server.mvc.Viewable;
import org.nkjmlab.webui.common.jaxrs.JaxrsView;
import org.nkjmlab.webui.common.jaxrs.ThymeleafModel;
import org.nkjmlab.webui.common.user.model.UserSession;

@Path("/")
public class CityWalkView extends JaxrsView {

	private static final String[] noAuthPathElements = { "index.html", "clear.html",
			"dev.html", "login.html", "signup.html", "how-to-use.html", "troubleshooting.html",
			"intro.html", "help.html", "tutorial.html", "check-environment.html" };

	@Override
	public Viewable getView(String filePathFromViewRoot, Map<String, String[]> params) {
		try {
			if (isRootPath(filePathFromViewRoot)) {
				return redirectTo("/index.html");
			}
			if (isFromServiceWorker(params)) {
				return createView(filePathFromViewRoot, new ThymeleafModel());
			}

			if (containsNoAuthPathElements(noAuthPathElements, filePathFromViewRoot)) {
				if (filePathFromViewRoot.equals("/signup.html")
						|| filePathFromViewRoot.equals("/check-environment.html")) {
					ThymeleafModel model = new ThymeleafModel();
					Locale lang = params.get("lang") != null
							? Locale.forLanguageTag(params.get("lang")[0]) : Locale.US;
					model.setLocale(lang);
					return createView(filePathFromViewRoot, model);
				}

				return createView(filePathFromViewRoot, new ThymeleafModel());
			}

			if (UserSession.of(request).isLogined()) {
				return createView(filePathFromViewRoot, new ThymeleafModel());
			} else {
				response.sendRedirect(
						getServletUrl() + "/login.html?msg=nologin&redirect="
								+ getFullRequestUrl());
				return createView("/login.html", new ThymeleafModel());
			}
		} catch (Exception e) {
			log.error(e, e);
			try {
				response.sendRedirect(getServletUrl() + "/index.html");
			} catch (IOException e1) {
				e1.printStackTrace();
			}
			return createView("/index.html", new ThymeleafModel());
		}

	}

	private boolean isFromServiceWorker(Map<String, String[]> params) {
		for (String key : params.keySet()) {
			if (key.equalsIgnoreCase("serviceWorker")) {
				return true;
			}
		}
		return false;
	}

}