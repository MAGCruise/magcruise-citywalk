package org.magcruise.citywalk.model.content;

public class TaskContent extends Content<TaskContent> {

	protected boolean checkIn = false;
	protected String label;

	public TaskContent() {
	}

	public TaskContent(String label, boolean checkpoint) {
		this.label = label;
		this.checkIn = checkpoint;
	}

	public boolean isCheckIn() {
		return checkIn;
	}

	public void setCheckIn(boolean checkIn) {
		this.checkIn = checkIn;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

}
