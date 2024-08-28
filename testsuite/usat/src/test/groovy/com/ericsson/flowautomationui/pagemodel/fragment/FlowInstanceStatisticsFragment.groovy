package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class FlowInstanceStatisticsFragment extends BaseFragment {

    @FindBy(className = "eaFlowAutomation-statisticsHolder-userTasksNumber")
    private WebElement userTasks

    @FindBy(className = "eaFlowAutomation-statisticsHolder-executingNumber")
    private WebElement executing

    @FindBy(className = "eaFlowAutomation-statisticsHolder-setUpNumber")
    private WebElement setUp

    @FindBy(className = "eaFlowAutomation-statisticsHolder-executedNumber")
    private WebElement executed

    @FindBy(className = "eaFlowAutomation-statisticsHolder-stoppedNumber")
    private WebElement stopped

    @FindBy(className = "eaFlowAutomation-statisticsHolder-failedNumber")
    private WebElement failed

    boolean compareValue(String userTasks, String executing, String setUp,
                         String executed, String stopped, String failed) {
        System.out.println(String.format("Summary: %s %s %s %s %s %s", getAmountOfUserTasks(), getAmountExecuting(), getAmountInSetUp(), getAmountOfExecuted(), getAmountStopped(), getAmountFailed()))
        return (getAmountOfUserTasks() == userTasks &&
                getAmountExecuting() == executing &&
                getAmountInSetUp() == setUp &&
                getAmountOfExecuted() == executed &&
                getAmountStopped() == stopped &&
                getAmountFailed() == failed)
    }

    String getAmountOfUserTasks() {
        return getText(userTasks)
    }

    String getAmountExecuting() {
        return getText(executing)
    }

    String getAmountInSetUp() {
        return getText(setUp)
    }

    String getAmountOfExecuted() {
        return getText(executed)
    }

    String getAmountStopped() {
        return getText(stopped)
    }

    String getAmountFailed() {
        return getText(failed)
    }
}
