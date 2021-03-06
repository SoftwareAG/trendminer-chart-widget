/**
 * WidgetHelper is a utility class that will provide useful function to
 * authors when creating new widgets for Cumulocity.
 *
 * The main hook is to create an instance of the class in your widget
 * and then use whatever functionality you need.
 *
 * Widgets have config in cumulocity which gets updated when you
 * invoke the config page for the widget. This class wraps that
 * and provides useful common functionally on top.
 *
 * @format
 */

import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";

/**
 * The C8Y process has a standard member "config". This member has
 * the data from the config screen in it along with standard data
 * that might be set. We create a member of the config option containing
 * our set of configuration data.
 *
 * typically each widget class that accesses the config data (to set or retrieve)
 * will have an instance of this class. It will be created in the constructor
 * to default the config and ngInit to make sure it is up to date.
 *
 * The CONFIGTYPE generic is the class of WidgetConfig (or extended type TBD)
 */
export class WidgetHelper<CONFIGTYPE> {
    /**
     * The following 2 members are for checking types
     * do not store data in these!!!!
     */
    private reference: CONFIGTYPE;

    /**
     *  member that holds the actual data
     */
    private config: CONFIGTYPE;

    /**
     *
     * E.G. let h = new WidgetHelper(config, MyConfigType); // type argument inference
     *
     * @param c is the configuration member supplied by default
     * @param ConfigCreator The type of the Custom Widget Class
     */
    constructor(c: Object, ConfigCreator: new () => CONFIGTYPE) {
        this.reference = new ConfigCreator(); //template

        // only set if it doesn't exist
        if (!_.has(c, "customwidgetdata")) {
            this.config = new ConfigCreator();
            console.log("Create new config", this.config);
        } else {
            // because this is stored and retrieved from mongo db
            // reset the prototype and leave the data
            console.log("Config Exists", c);
            this.config = _.get(c, "customwidgetdata");
            if (Object.getPrototypeOf(this.config) !== Object.getPrototypeOf(this.reference)) {
                Object.setPrototypeOf(this.config, Object.getPrototypeOf(this.reference));
            }
        }
    }

    /**
     * Use this member when accessing the configuration data
     *
     * @returns a reference to the widgets configuration with class methods
     */
    getWidgetConfig(): CONFIGTYPE {
        return this.config;
    }

    /**
     * Set the customwidgetdata member with the current config
     * typically call this when updating the config in a form
     *
     * @param c config member from the custom widget
     */
    setWidgetConfig(c: any) {
        _.set(c, "customwidgetdata", this.config);
    }

    getUniqueID(): string {
        if (!_.has(this.config, "uuid")) {
            _.set(this.config, "uuid", uuidv4());
        }
        //console.log(this.config);
        return _.get(this.config, "uuid");
    }
}
