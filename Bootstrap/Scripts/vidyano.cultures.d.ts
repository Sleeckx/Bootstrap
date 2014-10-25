declare module Vidyano {
    class CultureInfo {
        public name: string;
        public numberFormat: CultureInfoNumberFormat;
        public dateFormat: CultureInfoDateFormat;
        static currentCulture: CultureInfo;
        static invariantCulture: CultureInfo;
        static cultures: linqjs.Dictionary<string, CultureInfo>;
        constructor(name: string, numberFormat: CultureInfoNumberFormat, dateFormat: CultureInfoDateFormat);
    }
    interface CultureInfoNumberFormat {
        naNSymbol: string;
        negativeSign: string;
        positiveSign: string;
        negativeInfinityText: string;
        positiveInfinityText: string;
        percentSymbol: string;
        percentGroupSizes: number[];
        percentDecimalDigits: number;
        percentDecimalSeparator: string;
        percentGroupSeparator: string;
        percentPositivePattern: string;
        percentNegativePattern: string;
        currencySymbol: string;
        currencyGroupSizes: number[];
        currencyDecimalDigits: number;
        currencyDecimalSeparator: string;
        currencyGroupSeparator: string;
        currencyNegativePattern: string;
        currencyPositivePattern: string;
        numberGroupSizes: number[];
        numberDecimalDigits: number;
        numberDecimalSeparator: string;
        numberGroupSeparator: string;
    }
    interface CultureInfoDateFormat {
        amDesignator: string;
        pmDesignator: string;
        dateSeparator: string;
        timeSeparator: string;
        gmtDateTimePattern: string;
        universalDateTimePattern: string;
        sortableDateTimePattern: string;
        dateTimePattern: string;
        longDatePattern: string;
        shortDatePattern: string;
        longTimePattern: string;
        shortTimePattern: string;
        firstDayOfWeek: number;
        dayNames: string[];
        shortDayNames: string[];
        minimizedDayNames: string[];
        monthNames: string[];
        shortMonthNames: string[];
    }
}
