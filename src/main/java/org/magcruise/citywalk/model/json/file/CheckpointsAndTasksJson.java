package org.magcruise.citywalk.model.json.file;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class CheckpointsAndTasksJson {

	private List<CheckpointJson> checkpoints = new ArrayList<>();
	private List<TaskJson> tasks = new ArrayList<>();

	public List<CheckpointJson> getCheckpoints() {
		return checkpoints;
	}

	public void setCheckpoints(List<CheckpointJson> checkpoints) {
		this.checkpoints = checkpoints;
	}

	public List<TaskJson> getTasks() {
		return tasks;
	}

	public void setTasks(List<TaskJson> tasks) {
		this.tasks = tasks;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public void addCheckpoint(CheckpointJson checkpointJson) {
		checkpoints.add(checkpointJson);
	}

	public void addTask(TaskJson taskJson) {
		tasks.add(taskJson);
	}

}
