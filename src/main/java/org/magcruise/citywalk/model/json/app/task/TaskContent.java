package org.magcruise.citywalk.model.json.app.task;

import org.magcruise.citywalk.model.json.app.TaskJson;
import org.nkjmlab.util.json.JsonObject;

public class TaskContent extends JsonObject<TaskContent> {

	protected boolean checkin = false;
	protected String label;
	protected double point;
	// デフォルトのActiveAreaはInteger.MAX_VALUE[m]
	protected int activeArea = Integer.MAX_VALUE;

	public TaskContent() {
	}

	public TaskContent(boolean checkin, double point, String label, int activeArea) {
		this.label = label;
		this.point = point;
		this.checkin = checkin;
		this.activeArea = activeArea;
	}

	public TaskJson toTaskJson(String id) {
		TaskJson j = new TaskJson();
		j.setId(id);
		j.setTaskType(getClass().getSimpleName());
		j.setLabel(getLabel());
		j.setPoint(getPoint());
		j.setActiveArea(getActiveArea());
		return j;
	}

	public boolean isCheckin() {
		return checkin;
	}

	public void setCheckin(boolean checkin) {
		this.checkin = checkin;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public double getPoint() {
		return point;
	}

	public void setPoint(double point) {
		this.point = point;
	}

	public int getActiveArea() {
		return activeArea;
	}

	public void setActiveArea(int activeArea) {
		if (activeArea == -1) {
			return;
		}
		this.activeArea = activeArea;
	}

}
