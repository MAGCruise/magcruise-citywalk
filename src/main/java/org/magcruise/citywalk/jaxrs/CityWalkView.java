package org.magcruise.citywalk.jaxrs;

import java.io.IOException;
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

			if (filePathFromViewRoot == null || filePathFromViewRoot.equals("")
					|| filePathFromViewRoot.equals("/")) {
				response.sendRedirect(getServletUrl() + "/index.html");
				return createView("/index.html", new ThymeleafModel());
			} else if (filePathFromViewRoot.contains("index.html")
					|| filePathFromViewRoot.contains("login.html")
					|| filePathFromViewRoot.contains("register.html")
					|| filePathFromViewRoot.contains("how-to-use.html")) {
				return createView(filePathFromViewRoot, new ThymeleafModel());
			} else {
				if (UserSession.of(request).isLogined()) {
					return createView(filePathFromViewRoot, new ThymeleafModel());
				}
				response.sendRedirect(getServletUrl() + "/index.html");
				return createView("/index.html", new ThymeleafModel());
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

}