package org.magcruise.citywalk.model.relation;

import java.util.List;
import java.util.stream.Collectors;

import org.magcruise.citywalk.model.row.Task;
import org.magcruise.citywalk.model.task.PinTask;
import org.magcruise.citywalk.model.task.TaskContent;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class TasksTable extends RelationalModel<Task> {

	public static final String TABLE_NAME = "TASKS";
	private static final String ID = "id";
	private static final String CREATED_AT = "created_at";
	public static final String CHECKPOINT_IDS = "checkpoint_ids";
	private static final String CONTENT = "content";

	public TasksTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.VARCHAR, Keyword.PRIMARY_KEY);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		addColumnDefinition(CHECKPOINT_IDS, Keyword.VARCHAR);
		addColumnDefinition(CONTENT, Keyword.VARCHAR);
	}

	@Override
	public void createIndexes() {
	}

	public List<Task> getTasks(String checkpointId) {
		return getClient()
				.readList(Task.class,
						"SELECT * FROM " + TABLE_NAME)
				.stream().filter(c -> c.getCheckpointIds().contains(checkpointId))
				.collect(Collectors.toList());
	}

	public List<Task> getTasksForCourse(String courseId) {
		List<Task> tasks = getClient().readList(Task.class,
				"SELECT " + TABLE_NAME + ".* FROM " + TABLE_NAME + " JOIN "
						+ CheckpointsTable.TABLE_NAME + " ON " + TABLE_NAME
						+ "." + CHECKPOINT_IDS + " LIKE CONCAT('%',"
						+ CheckpointsTable.TABLE_NAME + "." + ID + ", '%')");

		return tasks;
	}

	public boolean isCheckin(String taskId) {
		Task t = getTask(taskId);
		if (t == null) {
			log.error(taskId);
			return false;
		}
		TaskContent c = getTask(taskId).getContentObject();
		if (c == null) {
			log.error(getTask(taskId));
			return false;
		}
		return c.isCheckin();
	}

	public Task getTask(String taskId) {
		return getClient().readByPrimaryKey(Task.class, taskId);
	}

	public boolean isPinTask(String taskId) {
		return getTask(taskId).getContentObject().getInstanceClass()
				.contains(PinTask.class.getSimpleName());
	}

}
