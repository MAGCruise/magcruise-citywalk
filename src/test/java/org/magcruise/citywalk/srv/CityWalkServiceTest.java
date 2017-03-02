package org.magcruise.citywalk.srv;

import org.junit.Test;
import org.magcruise.citywalk.jsonrpc.CityWalkServiceClient;

public class CityWalkServiceTest {
	protected static org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager
			.getLogger();

	private CityWalkServiceClient client = new CityWalkServiceClient(
			"http://localhost:8080/magcruise-citywalk/CityWalkService");

	@Test
	public void test() {
	}

}
