package org.magcruise.citywalk.websocket;

import java.io.IOException;
import java.net.URI;

import javax.websocket.ClientEndpoint;
import javax.websocket.ContainerProvider;
import javax.websocket.DeploymentException;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@ClientEndpoint
public class EventPublisherClient {
	protected static Logger log = LogManager.getLogger();

	private URI uri;
	private Session session;

	public static void main(String[] args) {

		EventPublisherClient client = new EventPublisherClient(
				"ws://localhost:8080/magcruise-citywalk/websocket/activity", "waseda",
				"cafeteria", "ayaki");

		client.start();
		while (true) {
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}

	}

	public EventPublisherClient(String websocketEndPointBaseUrl, String courseId,
			String checkpointId, String userId) {
		this.uri = URI.create(websocketEndPointBaseUrl + "/" + courseId + "/"
				+ checkpointId + "/" + userId + "");
	}

	public void start() {
		try {
			session = ContainerProvider.getWebSocketContainer().connectToServer(this, uri);
			if (session.isOpen()) {
				log.info("session is open to {}", uri);
			}
		} catch (DeploymentException | IOException e) {
			log.error("uri is {}", uri);
			log.error(e, e);
			throw new RuntimeException(e);
		}
	}

	@OnOpen
	public void onOpen(Session session) {
		log.info("onOpen");
	}

	@OnMessage
	public void onMessage(String message) {
		log.info(message);
	}

	@OnError
	public void onError(Throwable th) {
		log.error("onError");
	}

	@OnClose
	public void onClose(Session session) {
		log.info("onClose");
		try {
			session.close();
			this.session.close();
		} catch (IOException e) {
			log.error(e, e);
		}
	}

}