package org.magcruise.citywalk.srv;

import org.junit.Test;
import org.magcruise.citywalk.jsonrpc.CityWalkServiceClient;
import org.magcruise.citywalk.model.input.SelectionInput;
import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.row.VerifiedActivity;

public class CityWalkServiceTest {
	protected static org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager
			.getLogger();

	private CityWalkServiceClient client = new CityWalkServiceClient(
			"http://localhost:8080/magcruise-citywalk/CityWalkService");

	@Test
	public void test() {
		client.addActivity(
				new ActivityJson(
						new VerifiedActivity("waseda", "ayaki", "cafeteria", 35.0, 138.2,
								"cafeteria-selection", 2.5,
								new SelectionInput("10"))));
		log.debug(client.login("ayaki"));
	}

}
