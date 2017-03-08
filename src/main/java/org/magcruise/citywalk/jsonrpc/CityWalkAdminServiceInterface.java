package org.magcruise.citywalk.jsonrpc;

import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.EntryJson;
import org.magcruise.citywalk.model.json.MovementJson;
import org.magcruise.citywalk.model.json.UserAccountJson;

public interface CityWalkAdminServiceInterface {

	ActivityJson[] getCheckinLogs(String checkpointId);

	ActivityJson[] getCheckinLogs(String userId, String courseId);

	MovementJson[] getMovements(String userId, String courseId, int incrementSize);

	UserAccountJson[] getUsers();

	EntryJson[] getEntries();

	EntryJson[] getEntries(String userId);

}
