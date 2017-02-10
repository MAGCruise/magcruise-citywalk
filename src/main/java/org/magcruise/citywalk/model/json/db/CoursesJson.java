package org.magcruise.citywalk.model.json.db;

import java.util.ArrayList;
import java.util.List;

public class CoursesJson {
	private List<CourseJson> courses = new ArrayList<>();

	public CoursesJson(List<CourseJson> courses) {
		this.courses.addAll(courses);
	}

	public CoursesJson() {
	}

	public List<CourseJson> getCourses() {
		return courses;
	}

	public void setCourses(List<CourseJson> courses) {
		this.courses = courses;
	}

}
