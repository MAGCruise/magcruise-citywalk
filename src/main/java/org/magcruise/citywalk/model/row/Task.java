package org.magcruise.citywalk.model.row;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.JsonConstructiveObject;
import org.magcruise.citywalk.model.content.TaskContent;
import org.magcruise.citywalk.model.relation.RelationalModel;
import org.magcruise.citywalk.model.relation.TasksTable;

import jp.go.nict.langrid.repackaged.net.arnx.jsonic.JSON;
import net.arnx.jsonic.JSONHint;
import net.sf.persist.annotations.Column;
import net.sf.persist.annotations.NoColumn;
import net.sf.persist.annotations.Table;

@Table(name = TasksTable.TABLE_NAME)
public class Task extends RowModel<Task> {

	private long id;
	private List<String> checkpointIds = new ArrayList<>();
	private TaskContent content;

	public Task() {
	}

	public Task(List<String> checkpointIds, TaskContent content) {
		this.checkpointIds.addAll(checkpointIds);
		this.content = content;
	}

	@Column(autoGenerated = true)
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	@Column(name = RelationalModel.CHECKPOINT_IDS)
	public String getCheckpointIdsString() {
		return JSON.encode(checkpointIds);
	}

	public void setCheckpointIdsString(String checkpointId) {
		@SuppressWarnings("unchecked")
		List<String> r = JSON.decode(checkpointId, List.class);
		this.checkpointIds = r;
	}

	@NoColumn
	public List<String> getCheckpointIds() {
		return checkpointIds;
	}

	public void setCheckpointIds(List<String> checkpointIds) {
		this.checkpointIds = checkpointIds;
	}

	public String getContent() {
		return content.encodeToJson();
	}

	public void setContent(String json) {
		this.content = JsonConstructiveObject.decodeFromJson(TaskContent.class,
				json);
	}

	@JSONHint(ignore = true)
	@NoColumn
	public TaskContent getContentObject() {
		return content;
	}

	public void setContentObject(TaskContent content) {
		this.content = content;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this,
				ToStringStyle.SHORT_PREFIX_STYLE);
	}

}
