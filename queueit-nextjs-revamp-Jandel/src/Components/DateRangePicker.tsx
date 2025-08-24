import { useEffect, useRef } from "react";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "daterangepicker/daterangepicker.css";
import "daterangepicker";
import moment from "moment";

interface DateRangePickerProps {
  dateRange: string;
  setDateRange: Function;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  setDateRange,
}) => {
  const pickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!pickerRef.current) return;

    const start = moment().add(0, "month").startOf("month"); // First day of the next month
    const end = moment().add(0, "month").endOf("month"); // Last day of the next month

    function cb(start: moment.Moment, end: moment.Moment) {
      setDateRange(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"));
    }

    const $picker = $(pickerRef.current);
    $picker.daterangepicker(
      {
        startDate: start,
        endDate: end,
        ranges: {
          "Today": [moment().startOf('day'), moment().endOf('day')],
          "Yesterday": [moment().subtract(1, "days"), moment().subtract(1, "days")],
          "Last 7 Days": [moment().subtract(6, "days"), moment()],
          "Last 30 Days": [moment().subtract(29, "days"), moment()],
          "This Month": [moment().startOf("month"), moment().endOf("month")],
          "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
          "Next Month": [moment().add(1, "month").startOf("month"), moment().add(1, "month").endOf("month")], // Added Next Month range
        },
      },
      cb
    );

    cb(start, end); // Set the initial range

    return () => {
      if ($picker.data("daterangepicker")) {
        $picker.data("daterangepicker").remove(); // Clean up
      }
    };
  }, []);

  return (
    <input
      ref={pickerRef}
      className="form-control"
      readOnly
      value={dateRange}
      style={{ cursor: "pointer", width: "100%" }}
    />
  );
};

export default DateRangePicker;
