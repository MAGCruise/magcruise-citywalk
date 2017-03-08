package org.magcruise.citywalk.jaxrs;

import java.io.IOException;

public class ExceptionUtils {

	public static String getMessageWithStackTrace(Throwable e) {
		return getMessageWithStackTrace(e, 3, 9);
	}

	public static String getMessageWithStackTrace(Throwable e, int maxStackDepth,
			int maxTotalStackDepth) {
		StringBuilder b = new StringBuilder();
		try {
			appendMessage(e, b);
			b.append(". stack trace\"\"\"\n");
			appendStackTrace(e, b, maxStackDepth, maxTotalStackDepth);
			b.append("\n\"\"\"");
		} catch (IOException ex) {
			// IOException must not be thrown
			throw new RuntimeException(ex);
		}
		return b.toString();
	}

	public static void appendMessage(Throwable e, Appendable buff) throws IOException {
		buff.append(e.toString());
	}

	public static void appendStackTrace(Throwable e, Appendable buff, int maxStackDepth,
			int maxTotalStackDepth)
			throws IOException {
		boolean first = true;
		int stackCount = 0;
		while (e != null) {
			if (first) {
				first = false;
			} else {
				buff.append("Caused by: ");
				appendMessage(e, buff);
				buff.append("\n");
			}
			StackTraceElement[] sts = e.getStackTrace();
			maxStackDepth = Math.min(maxStackDepth, sts.length);
			if (maxStackDepth > 0) {
				buff.append("\tat ");
				buff.append(sts[0].toString());
				buff.append("\n");
				for (int si = 1; si < maxStackDepth; si++) {
					if (stackCount < maxTotalStackDepth) {
						buff.append("\tat ");
						buff.append(sts[si].toString());
						buff.append("\n");
						stackCount++;
					}
				}
				if (sts.length > maxStackDepth) {
					buff.append("\t... ");
					buff.append(Integer.toString(sts.length - maxStackDepth));
					buff.append(" more");
					buff.append("\n");
				}
			}
			e = e.getCause();
			if (e == null)
				break;
		}
	}

}
