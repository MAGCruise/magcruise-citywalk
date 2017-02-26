package org.magcruise.citywalk.model.task;

import org.nkjmlab.util.json.JsonObject;

public class TaskContent extends JsonObject<TaskContent> {

	protected boolean checkin = false;
	protected String label;
	protected double point;
	// デフォルトのActiveAreaは100m
	protected int activeArea = 100;

	public TaskContent() {
	}

	public TaskContent(boolean checkin, double point, String label, int activeArea) {
		this.label = label;
		this.point = point;
		this.checkin = checkin;
		this.activeArea = activeArea;
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
		this.activeArea = activeArea;
	}

}
