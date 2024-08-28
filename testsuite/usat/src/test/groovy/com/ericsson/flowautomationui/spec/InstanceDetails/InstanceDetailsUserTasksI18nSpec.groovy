package com.ericsson.flowautomationui.spec.InstanceDetails


import com.ericsson.flowautomationui.pagemodel.fragment.StartInstanceDialogFragment
import com.ericsson.flowautomationui.pagemodel.fragment.UserTaskDetailsButtonsFragment
import com.ericsson.flowautomationui.pagemodel.fragment.UserTaskDetailsFragment
import com.ericsson.flowautomationui.pagemodel.page.InstanceDetailsPage
import com.ericsson.flowautomationui.pagemodel.page.InstancesPage
import com.ericsson.flowautomationui.spec.BaseSpecification
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith
import org.openqa.selenium.support.FindBy

import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.CANCEL
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.CONFIRM_EXECUTION

@RunWith(ArquillianSputnik)
class InstanceDetailsUserTasksI18nSpec extends BaseSpecification {

    public static final String CONTINUE_BUTTON = "Continue"
    public static final String EXECUTE_BUTTON = "Execute"

    @Page
    InstancesPage instancesPage

    @Page
    InstanceDetailsPage instanceDetailsPage

    @Page
    UserTaskDetailsFragment userTaskDetailsFragment

    @Page
    StartInstanceDialogFragment dialogFragment

    @FindBy(className = "eaFlowInstanceDetails-wActionPanel-content")
    UserTaskDetailsButtonsFragment userTaskDetailsButtonsFragment


    def "test if you can get to flow instance details"() {
        setup: "flow automation is running"
        openFlowAutomationUrl()
        instancesPage.isTopsectionVisible()
        instancesPage.verifyTopSectionTitle(InstancesPage.TITLE)

        when: "unselect my flow instances"
        instancesPage.clickMyInstances()

        then: "when table is visible"
        instancesPage.instancesTableFragment.getTable()

        when: "click on an instance in the table"
        instancesPage.instancesTableFragment.selectRow("internationalization-tests")

        then: "click on the flow instance details button"
        instancesPage.actionBarFragment.clickActionBarButton("View Instance Details")

        and: "Verify top section"
        instancesPage.verifyTopSectionTitle("Flow Instance Details")

        and: "Verify flow instance details summary section"
        def flowInstanceDetailsSummaryHeaderFragment = instanceDetailsPage.flowInstanceDetailsSummaryHeaderFragment
        flowInstanceDetailsSummaryHeaderFragment.name == "internationalization-tests"
    }

    def "test Task: Choose Setup"() {
        when:
        userTaskDetailsFragment.clickRadio(0)

        then: "verify title Task: Choose Setup"
        userTaskDetailsFragment.userTaskTitle == "Task: 设置类型"

        and: "verify set up elements are visible"
        userTaskDetailsFragment.getContentName(0) == "互动"
        userTaskDetailsFragment.getContentName(1) == "文件输入"
        userTaskDetailsFragment.isFileInputNotVisible()

        then: "click on continue"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE_BUTTON)
    }

    def "test task: Grouping & Nesting"() {
        when: "verify title Task: Grouping & Nesting"
        userTaskDetailsFragment.userTaskTitle == "Task: 分組和嵌套"

        then: "verify the different labels and input text into the text fields"
        userTaskDetailsFragment.getLabelName(0) == "組與文本輸入"
        userTaskDetailsFragment.getTextName(0) == "文字輸入1"
        userTaskDetailsFragment.getTextName(1) == "文字輸入2"
        userTaskDetailsFragment.deleteCharsAndSetFieldText(0, "First Input", 0)
        userTaskDetailsFragment.deleteCharsAndSetFieldText(1, "Second Input", 0)

        then: "verify the different labels and select the grouped checkboxes"
        userTaskDetailsFragment.getLabelName(1) == "帶複選框的組"
        userTaskDetailsFragment.getCheckBoxLabel(0) == "複選框1"
        userTaskDetailsFragment.getCheckBoxLabel(1) == "複選框2"
        userTaskDetailsFragment.getCheckBoxLabel(2) == "複選框3"
        userTaskDetailsFragment.clickCheckBoxWithLabel("複選框1")
        userTaskDetailsFragment.clickCheckBoxWithLabel("複選框2")
        userTaskDetailsFragment.clickCheckBoxWithLabel("複選框3")

        then: "verify the different labels and select the nested checkboxes"
        userTaskDetailsFragment.getLabelName(2) == "具有多個級別的組"
        userTaskDetailsFragment.getLabelName(3) == "2級組"
        userTaskDetailsFragment.getLabelName(4) == "3級組與復選框"
        userTaskDetailsFragment.getCheckBoxLabel(3) == "嵌套的复选框1"
        userTaskDetailsFragment.getCheckBoxLabel(4) == "嵌套的复选框2"
        userTaskDetailsFragment.clickCheckBoxWithLabel("嵌套的复选框1")
        userTaskDetailsFragment.clickCheckBoxWithLabel("嵌套的复选框2")

        then: "click on continue"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE_BUTTON)
    }


    def "test Review and confirm"() {
        when: "verify Review and confirm labels"

        userTaskDetailsFragment.getLabelName(0) == "使用任务选择"
        userTaskDetailsFragment.getLabelName(1) == "信息"
        userTaskDetailsFragment.getLabelName(10) == "文字输入"
        userTaskDetailsFragment.getLabelName(11) == "文本輸入沒有長度限制"
        userTaskDetailsFragment.getLabelName(18) == "帶有信息的文本輸入"
        userTaskDetailsFragment.getLabelName(19) == "這是一個很長的信息"

        userTaskDetailsFragment.getLabelName(21) == "複選框"
        userTaskDetailsFragment.getLabelName(23) == "長標籤長標籤長標籤長標籤"
        userTaskDetailsFragment.getLabelName(24) == "單選按鈕"
        userTaskDetailsFragment.getLabelName(25) == "電台組標籤"

        and: "verify the name of the execute button"
        userTaskDetailsButtonsFragment.verifyNameFirstButton(EXECUTE_BUTTON)

        then: "Click on execute button"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(EXECUTE_BUTTON)

        then: "verify confirm execution dialog box"
        instanceDetailsPage.isDialogBoxDisplayed()
        def instDeetsDialogFragment = instanceDetailsPage.dialogFragment
        instDeetsDialogFragment.getDialogBoxHeading() == CONFIRM_EXECUTION

        then: "click the cancel button"
        dialogFragment.clickActionButton(CANCEL)
    }
}


