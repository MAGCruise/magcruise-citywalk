package org.magcruise.citywalk.conv;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

import org.magcruise.citywalk.model.json.init.CheckinJson;
import org.magcruise.citywalk.model.json.init.CheckpointJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;
import org.magcruise.citywalk.model.json.init.TaskJson;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.row.Checkpoint;
import org.magcruise.citywalk.model.row.Task;
import org.nkjmlab.util.json.JsonUtils;

public class InitialDataFactory {
	protected static org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager
			.getLogger();

	public static void main(String[] args) {
		CheckpointsAndTasksFactory.refreshCheckpointAtdTaskTable();
		CheckpointsAndTasksFactory
				.insertToDb("src/main/webapp/json/checkpoints-and-tasks/waseda.json");
		JsonUtils.encode(create("waseda"),
				"src/main/webapp/json/initial-data/waseda.json", true);
	}

	public static InitialDataJson create(String checkpointGroupId) {
		List<Checkpoint> checkpoints = new CheckpointsTable()
				.findByCheckpointGroupId(checkpointGroupId);
		return create(checkpoints);

	}

	private static InitialDataJson create(List<Checkpoint> checkpoints) {
		List<CheckpointJson> result = checkpoints.stream()
				.map(c -> {
					List<Task> tasks = new TasksTable().getTasks(c.getId());
					List<TaskJson> taskJsons = new ArrayList<>();
					CheckinJson checkin = new CheckinJson();
					for (Task t : tasks) {
						if (t.getContentObject().isCheckin()) {
							checkin = new CheckinJson(t);
						} else {
							taskJsons.add(new TaskJson(t));
						}
					}
					return new CheckpointJson(c.getId(), c.getName(), c.getLabel(), c.getLat(),
							c.getLon(), checkin, taskJsons);
				}).collect(Collectors.toList());
		return new InitialDataJson(result);

	}

}
