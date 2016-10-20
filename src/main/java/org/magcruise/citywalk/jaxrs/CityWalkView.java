package org.magcruise.citywalk.jaxrs;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;

import javax.ws.rs.Path;

import org.glassfish.jersey.server.mvc.Viewable;
import org.nkjmlab.webui.common.jaxrs.JaxrsView;
import org.nkjmlab.webui.common.jaxrs.ThymeleafModel;
import org.nkjmlab.webui.common.user.model.UserSession;

@Path("/")
public class CityWalkView extends JaxrsView {

	@Override
	public Viewable getView(String filePathFromViewRoot, Map<String, String[]> params) {
		try {
			if (isRoot(filePathFromViewRoot)) {
				response.sendRedirect(getServletUrl() + "/index.html");
				return createView("/index.html", new ThymeleafModel());
			}
			if (isUnneededLogin(filePathFromViewRoot)) {
				return createView(filePathFromViewRoot, new ThymeleafModel());
			}

			if (UserSession.of(request).isLogined()) {
				return createView(filePathFromViewRoot, new ThymeleafModel());
			} else {
				response.sendRedirect(
						getServletUrl() + "/login.html?msg=nologin&redirect=" + getFullUrl());
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

	private boolean isUnneededLogin(String filePathFromViewRoot) {
		for (String unneededLoginPage : Arrays.asList("index.html", "clear.html", "dev.html",
				"login.html", "signup.html", "how-to-use.html", "intro.html", "help.html")) {
			if (filePathFromViewRoot.contains(unneededLoginPage)) {
				return true;
			}
		}
		return false;
	}

	private boolean isRoot(String filePathFromViewRoot) {
		if (filePathFromViewRoot == null || filePathFromViewRoot.equals("")
				|| filePathFromViewRoot.equals("/")) {
			return true;
		}
		return false;
	}

}