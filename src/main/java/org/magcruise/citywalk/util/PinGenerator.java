package org.magcruise.citywalk.util;

import java.io.File;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.nkjmlab.util.csv.CsvUtils;
import org.nkjmlab.util.io.FileUtils;
import org.nkjmlab.util.security.Hash;

public class PinGenerator {

	public static void main(String[] args) {
		String salt = "ieiri";
		List<String> lines = new ArrayList<>();
		CsvUtils.readColumnNameMapList(CsvUtils.createDefaultCsvConfig(), new File("cps.csv"))
				.forEach(r -> {
					String l = r.get("id") + "\t" + r.get("name") + "\t";
					Set<String> pins = generatePins(8, r.get("id"), salt,
							Integer.valueOf(r.get("numOfPins")));
					l += String.join(",", pins);
					lines.add(l);
				});
		FileUtils.write(Paths.get("pins-" + System.currentTimeMillis() + ".txt"), lines);

	}

	private static Set<String> generatePins(int length, String checkpointId, String salt,
			int size) {
		Set<String> pins = new LinkedHashSet<>();
		while (pins.size() < size) {
			pins.add(toNumberString(
					Hash.hash(checkpointId, Hash.Algorithms.SHA256, salt + pins.size()), length));
		}
		return pins;
	}

	private static String toNumberString(String hash, int length) {
		return hash.replaceAll("[a-z]", "").substring(0, length);

	}

}
