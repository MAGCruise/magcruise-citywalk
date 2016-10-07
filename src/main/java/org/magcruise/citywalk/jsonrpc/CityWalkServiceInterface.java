package org.magcruise.citywalk.jsonrpc;

import java.util.List;
import java.util.Map;

import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.BadgeJson;
import org.magcruise.citywalk.model.json.RankingJson;
import org.magcruise.citywalk.model.json.RegisterResultJson;
import org.magcruise.citywalk.model.json.RewardJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;

import jp.go.nict.langrid.commons.rpc.intf.Parameter;

public interface CityWalkServiceInterface {

	InitialDataJson getInitialData(
			@Parameter(sample = "waseda") String checkpointGroupId);

	InitialDataJson getInitialDataFromFile(
			@Parameter(sample = "waseda") String checkpointGroupId);

	boolean login(@Parameter(sample = "ayaki") String userId,
			@Parameter(sample = "houchimin") String groupId);

	boolean logout(@Parameter(sample = "ayaki") String userId);

	RegisterResultJson register(@Parameter(sample = "ayaki") String userId,
			@Parameter(sample = "houchimin") String groupId);

	RewardJson addActivity(
			@Parameter(sample = "{\"userId\": \"ayaki\", " + "\"checkpointId\": \"1\", "
					+ "\"taskId\": \"1\", " + "\"score\": 9.0, " + "\"inputs\": "
					+ "{\"value\":\"1\"}}") ActivityJson json);

	void addMovements(List<Map<String, Object>> movements);

	BadgeJson[] getBadges(@Parameter(sample = "ayaki") String userId);

	RankingJson getRanking(@Parameter(sample = "ayaki") String userId);

	VisitedCheckpointJson[] getVisitedCheckpoints(
			@Parameter(sample = "sample-at-magcruise.org") String userId,
			@Parameter(sample = "waseda") String checkpointGroupId);

	String uploadImage(
			@Parameter(sample = "ayaki") String userId,
			@Parameter(sample = "data:image/jpeg;base64,"
					+ "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJ"
					+ "ChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/"
					+ "2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgo"
					+ "KCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/"
					+ "wAARCAATABIDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAYFBwT/"
					+ "xAAqEAACAQIEBQMFAQAAAAAAAAABAgMEEQAFBiESEzFBYSJRcQcUFkKi8f/"
					+ "EABYBAQEBAAAAAAAAAAAAAAAAAAMEBf/"
					+ "EAB0RAQACAQUBAAAAAAAAAAAAAAEAEQIDEhMhUSL/" + "2gAMAwEAAhEDEQA/"
					+ "ANDU+t6vJ5+RSQM9W6iWQzSKVQHpchd9h0Ht5x7tK6vqc3najzSGemmKXR40DRyW6/"
					+ "qbHvY/7z7UjU0urphJUwugaLhAa/"
					+ "qESgrfwwO19rdOltv6dAJqWohNW8CrEzLE7X5hJBJF+9l87A+bZG54yjurmrxFOa9X"
					+ "Kr8s09H6BncyhdgOW+384Y5stIiqBPlQaUCzs00yknuSBsPgYYprL1"
					+ "knx5IrMpXTOOFCFChCLADc7kn3xY6Zq5353E+8dPNVIeEArKiNwsPiw26YYYr1AMFg6b"
					+ "bTJ+uzGp+9qLNGBzG2WJABv2AG2GGGCjT/2Q==") String base64EncodedImage);

	boolean validateCheckpointsAndTasksJson(
			@Parameter(sample = "{\"checkpoints\":["
					+ "{\"id\":\"cafeteria\",\"lat\":38.4400,\"lon\":139.11090,\"checkpoint_group_ids\":[\"waseda\"]}],"
					+ "\"tasks\":[" + "{\"checkpoint_ids\":[\"cafeteria\"],"
					+ "\"content\":{\"instanceClass\":\"org.magcruise.citywalk.model.content.PhotoTask\",\"checkin\":true,"
					+ "\"label\":\"表示されている写真と同じ写真を撮って下さい．\",\"answer\":\"task/ieiri_photo_00.jpg\"}},"
					+ "{\"checkpoint_ids\":[\"aed-1\",\"aed-2\",\"aed-3\",\"aed-4\"],"
					+ "\"content\":{\"instanceClass\":\"org.magcruise.citywalk.model.content.QrCodeTask\",\"checkin\":true,"
					+ "\"label\":\"QRコードを撮って下さい．\",\"answer\":\"task/ieiri_qr_code_02.jpg\"}},"
					+ "{\"checkpoint_ids\":[\"cafeteria\"],\"content\":{\"instanceClass\":\"org.magcruise.citywalk.model.content.SelectionTask\","
					+ "\"label\":\"次のうち、理工の学食が発祥の地であるメニューはどれ？\","
					+ "\"selections\":[\"豚玉丼\",\"チキンおろしだれ\",\"カツカレー\",\"ポーク焼肉\"],\"answerIndex\":3}}]}") String json);

}
