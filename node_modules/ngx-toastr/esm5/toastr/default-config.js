/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Toast } from './toast.component';
var DefaultGlobalConfig = /** @class */ (function () {
    function DefaultGlobalConfig() {
        // Global
        this.maxOpened = 0;
        this.autoDismiss = false;
        this.newestOnTop = true;
        this.preventDuplicates = false;
        this.iconClasses = {
            error: 'toast-error',
            info: 'toast-info',
            success: 'toast-success',
            warning: 'toast-warning',
        };
        // Individual
        this.toastComponent = Toast;
        this.closeButton = false;
        this.timeOut = 5000;
        this.extendedTimeOut = 1000;
        this.enableHtml = false;
        this.progressBar = false;
        this.toastClass = 'toast';
        this.positionClass = 'toast-top-right';
        this.titleClass = 'toast-title';
        this.messageClass = 'toast-message';
        this.easing = 'ease-in';
        this.easeTime = 300;
        this.tapToDismiss = true;
        this.onActivateTick = false;
        this.progressAnimation = 'decreasing';
    }
    return DefaultGlobalConfig;
}());
export { DefaultGlobalConfig };
function DefaultGlobalConfig_tsickle_Closure_declarations() {
    /** @type {?} */
    DefaultGlobalConfig.prototype.maxOpened;
    /** @type {?} */
    DefaultGlobalConfig.prototype.autoDismiss;
    /** @type {?} */
    DefaultGlobalConfig.prototype.newestOnTop;
    /** @type {?} */
    DefaultGlobalConfig.prototype.preventDuplicates;
    /** @type {?} */
    DefaultGlobalConfig.prototype.iconClasses;
    /** @type {?} */
    DefaultGlobalConfig.prototype.toastComponent;
    /** @type {?} */
    DefaultGlobalConfig.prototype.closeButton;
    /** @type {?} */
    DefaultGlobalConfig.prototype.disableTimeOut;
    /** @type {?} */
    DefaultGlobalConfig.prototype.timeOut;
    /** @type {?} */
    DefaultGlobalConfig.prototype.extendedTimeOut;
    /** @type {?} */
    DefaultGlobalConfig.prototype.enableHtml;
    /** @type {?} */
    DefaultGlobalConfig.prototype.progressBar;
    /** @type {?} */
    DefaultGlobalConfig.prototype.toastClass;
    /** @type {?} */
    DefaultGlobalConfig.prototype.positionClass;
    /** @type {?} */
    DefaultGlobalConfig.prototype.titleClass;
    /** @type {?} */
    DefaultGlobalConfig.prototype.messageClass;
    /** @type {?} */
    DefaultGlobalConfig.prototype.easing;
    /** @type {?} */
    DefaultGlobalConfig.prototype.easeTime;
    /** @type {?} */
    DefaultGlobalConfig.prototype.tapToDismiss;
    /** @type {?} */
    DefaultGlobalConfig.prototype.onActivateTick;
    /** @type {?} */
    DefaultGlobalConfig.prototype.progressAnimation;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1jb25maWcuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtdG9hc3RyLyIsInNvdXJjZXMiOlsidG9hc3RyL2RlZmF1bHQtY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHMUMsSUFBQTs7O3lCQUVjLENBQUM7MkJBQ0MsS0FBSzsyQkFDTCxJQUFJO2lDQUNFLEtBQUs7MkJBQ1g7WUFDWixLQUFLLEVBQUUsYUFBYTtZQUNwQixJQUFJLEVBQUUsWUFBWTtZQUNsQixPQUFPLEVBQUUsZUFBZTtZQUN4QixPQUFPLEVBQUUsZUFBZTtTQUN6Qjs7OEJBR2dCLEtBQUs7MkJBQ1IsS0FBSzt1QkFFVCxJQUFJOytCQUNJLElBQUk7MEJBQ1QsS0FBSzsyQkFDSixLQUFLOzBCQUNOLE9BQU87NkJBQ0osaUJBQWlCOzBCQUNwQixhQUFhOzRCQUNYLGVBQWU7c0JBQ3JCLFNBQVM7d0JBQ1AsR0FBRzs0QkFDQyxJQUFJOzhCQUNGLEtBQUs7aUNBQzJCLFlBQVk7OzhCQWhDL0Q7SUFpQ0MsQ0FBQTtBQTlCRCwrQkE4QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUb2FzdCB9IGZyb20gJy4vdG9hc3QuY29tcG9uZW50JztcbmltcG9ydCB7IEdsb2JhbENvbmZpZyB9IGZyb20gJy4vdG9hc3RyLWNvbmZpZyc7XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0R2xvYmFsQ29uZmlnIGltcGxlbWVudHMgR2xvYmFsQ29uZmlnIHtcbiAgLy8gR2xvYmFsXG4gIG1heE9wZW5lZCA9IDA7XG4gIGF1dG9EaXNtaXNzID0gZmFsc2U7XG4gIG5ld2VzdE9uVG9wID0gdHJ1ZTtcbiAgcHJldmVudER1cGxpY2F0ZXMgPSBmYWxzZTtcbiAgaWNvbkNsYXNzZXMgPSB7XG4gICAgZXJyb3I6ICd0b2FzdC1lcnJvcicsXG4gICAgaW5mbzogJ3RvYXN0LWluZm8nLFxuICAgIHN1Y2Nlc3M6ICd0b2FzdC1zdWNjZXNzJyxcbiAgICB3YXJuaW5nOiAndG9hc3Qtd2FybmluZycsXG4gIH07XG5cbiAgLy8gSW5kaXZpZHVhbFxuICB0b2FzdENvbXBvbmVudCA9IFRvYXN0O1xuICBjbG9zZUJ1dHRvbiA9IGZhbHNlO1xuICBkaXNhYmxlVGltZU91dDogZmFsc2U7XG4gIHRpbWVPdXQgPSA1MDAwO1xuICBleHRlbmRlZFRpbWVPdXQgPSAxMDAwO1xuICBlbmFibGVIdG1sID0gZmFsc2U7XG4gIHByb2dyZXNzQmFyID0gZmFsc2U7XG4gIHRvYXN0Q2xhc3MgPSAndG9hc3QnO1xuICBwb3NpdGlvbkNsYXNzID0gJ3RvYXN0LXRvcC1yaWdodCc7XG4gIHRpdGxlQ2xhc3MgPSAndG9hc3QtdGl0bGUnO1xuICBtZXNzYWdlQ2xhc3MgPSAndG9hc3QtbWVzc2FnZSc7XG4gIGVhc2luZyA9ICdlYXNlLWluJztcbiAgZWFzZVRpbWUgPSAzMDA7XG4gIHRhcFRvRGlzbWlzcyA9IHRydWU7XG4gIG9uQWN0aXZhdGVUaWNrID0gZmFsc2U7XG4gIHByb2dyZXNzQW5pbWF0aW9uOiAnZGVjcmVhc2luZycgfCAnaW5jcmVhc2luZycgPSAnZGVjcmVhc2luZyc7XG59XG4iXX0=