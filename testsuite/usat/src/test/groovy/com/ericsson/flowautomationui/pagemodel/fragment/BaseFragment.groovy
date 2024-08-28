package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import java.util.function.Predicate

import static org.jboss.arquillian.graphene.Graphene.waitGui

class BaseFragment {

    List<WebElement> waitVisible(List<WebElement> elements) {
        for (WebElement element : elements) {
            waitVisible(element)
        }

        return elements
    }

    WebElement waitVisible(WebElement element) {
        waitGui().until().element(element).is().visible()
        return element
    }

    WebElement waitNotVisible(WebElement element) {
        waitGui().until().element(element).is().not().visible()
        return element
    }

    WebElement waitPresent(WebElement element) {
        waitGui().until().element(element).is().present()
        return element
    }

    WebElement waitNotPresent(WebElement element) {
        waitGui().until().element(element).is().not().present()
        return element
    }

    WebElement waitClickable(WebElement element) {
        waitGui().until().element(element).is().clickable()
        return element
    }

    void click(WebElement element) {
        waitVisible(element)
        waitClickable(element).click()
    }

    List<WebElement> findElements(WebDriver driver, String element) {
        return driver.findElements(By.className(element))
    }

    String getText(WebElement element) {
        return waitVisible(element).getText().trim()
    }

    boolean clickButton(final List<WebElement> elements, final String name) {
        return clickButton(elements, { button -> (name == button.getText()) } as Predicate<? super WebElement>)
    }

    boolean clickButton(final List<WebElement> elements, final Predicate<? super WebElement> predicate) {
        Optional<WebElement> element = elements.stream().filter(predicate).findFirst()
        if (element.isPresent()) {
            click(element.get())
            return true
        }
        return false
    }

    boolean clickActionButton(List<WebElement> actionButtons, final String actionButtonToClick) {
        for (WebElement button : actionButtons) {
            if (button.getText() == actionButtonToClick) {
                button.click()
                return true
            }
        }

        return false
    }
}
