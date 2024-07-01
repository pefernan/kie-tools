package org.kie.kogito.calendar;

import org.jbpm.process.core.timer.BusinessCalendar;
import org.jbpm.process.core.timer.BusinessCalendarImpl;

import java.io.InputStream;
import java.util.Date;
import java.util.Properties;

public class CustomBusinessCalendar implements BusinessCalendar {
    private BusinessCalendar delegate;

    public CustomBusinessCalendar() {
        this.delegate = new BusinessCalendarImpl(readCalendarProperties());
    }

    @Override
    public long calculateBusinessTimeAsDuration(String timeExpression) {
        return delegate.calculateBusinessTimeAsDuration(timeExpression);
    }

    @Override
    public Date calculateBusinessTimeAsDate(String timeExpression) {
        return delegate.calculateBusinessTimeAsDate(timeExpression);
    }

    private Properties readCalendarProperties() {
        Properties props = new Properties();
        try (InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream("calendar.properties")) {
            props.load(is);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return props;
    }
}
