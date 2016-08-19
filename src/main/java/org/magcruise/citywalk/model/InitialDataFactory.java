package org.magcruise.citywalk.model;

import java.util.List;
import java.util.stream.Collectors;

import org.magcruise.citywalk.model.json.CheckinJson;
import org.magcruise.citywalk.model.json.CheckpointJson;
import org.magcruise.citywalk.model.json.TaskJson;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.row.Task;

import jp.go.nict.langrid.repackaged.net.arnx.jsonic.JSON;

public class InitialDataFactory {
	protected static org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager
			.getLogger();

	public static void main(String[] args) {
		CheckpointsAndTasksImporter.main(args);
		List<CheckpointJson> result = new CheckpointsTable().getCheckpoints("waseda").stream()
				.map(c -> {
					List<Task> tasks = new TasksTable().getTasks(c.getId());
					TaskJson task = new TaskJson();
					CheckinJson checkin = new CheckinJson();
					for (Task t : tasks) {
						if (t.getContentObject().isCheckin()) {
							checkin = new CheckinJson(t);
						} else {
							task = new TaskJson(t);
						}
					}
					return new CheckpointJson(c.getId(), c.getName(), c.getLat(), c.getLon(),
							checkin, task);
				}).collect(Collectors.toList());

		log.info(JSON.encode(result, true));
	}

}
